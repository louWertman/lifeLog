import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';
import bcrypt from 'bcryptjs';

const config: sql.config = {
  user: process.env.DB_USER!,
  password: process.env.DB_PASS!,
  server: process.env.DB_SERVER!,
  database: process.env.DB_NAME!,
  options: {
    encrypt: true,
    trustServerCertificate: false,
  },
};

let pool: sql.ConnectionPool | null = null;
async function getConnection() {
  if (!pool) pool = await sql.connect(config);
  return pool;
}

export async function POST(req: NextRequest) {
  try {
    const { date, mood, content, habits, token } = await req.json();

    if (!date || !content || !token) {
      return NextResponse.json({ success: false, error: 'Missing required entry data' }, { status: 400 });
    }

    const pool = await getConnection();

    // Validate sync_token
    const result = await pool.request().query('SELECT sync_token FROM account_info WHERE sync = 1');
    let matchedToken: Buffer | null = null;

    for (const row of result.recordset) {
      const dbHash = row.sync_token.toString();
      const isMatch = await bcrypt.compare(token, dbHash);
      if (isMatch) {
        matchedToken = row.sync_token;
        break;
      }
    }

    if (!matchedToken) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    // Check if entry already exists
    const existingEntry = await pool.request()
      .input('date', sql.Date, date)
      .input('token', sql.VarBinary(256), matchedToken)
      .query(`SELECT entry_id, mood_id FROM entry_info WHERE entry_date = @date AND sync_token = @token`);

    let entryId: string;
    let moodId: string;

    if (existingEntry.recordset.length > 0) {
      entryId = existingEntry.recordset[0].entry_id;
      const currentMoodId = existingEntry.recordset[0].mood_id;

      const moodQuery = await pool.request()
        .input('desc', sql.VarChar(100), mood)
        .input('token', sql.VarBinary(256), matchedToken)
        .query(`SELECT mood_id FROM moods WHERE description = @desc AND sync_token = @token`);

      if (moodQuery.recordset.length > 0) {
        // Use existing mood
        moodId = moodQuery.recordset[0].mood_id;
      } else {
        // Update existing mood_id to new description
        moodId = currentMoodId;
        await pool.request()
          .input('mood_id', sql.Char(4), moodId)
          .input('desc', sql.VarChar(100), mood)
          .query(`UPDATE moods SET description = @desc WHERE mood_id = @mood_id`);
      }

      // Update existing entry
      await pool.request()
        .input('entry_id', sql.Char(7), entryId)
        .input('entry_date', sql.Date, date)
        .input('journal_entry', sql.VarChar(8000), content)
        .input('mood_id', sql.Char(4), moodId)
        .query(`UPDATE entry_info SET journal_entry = @journal_entry, mood_id = @mood_id WHERE entry_id = @entry_id`);

      // Clear and re-insert present_habits
      await pool.request()
        .input('entry_id', sql.Char(7), entryId)
        .query(`DELETE FROM present_habits WHERE entry_id = @entry_id`);

    } else {
      // Generate new entry_id
      const entryResult = await pool.request().query('SELECT entry_id FROM entry_info');
      const existingEntryIds = entryResult.recordset.map((r: any) => parseInt(r.entry_id.substring(1)));
      let nextEntryNum = 1;
      while (existingEntryIds.includes(nextEntryNum)) nextEntryNum++;
      entryId = `E${nextEntryNum.toString().padStart(6, '0')}`;

      // Check or create mood_id
      const moodQuery = await pool.request()
        .input('desc', sql.VarChar(100), mood)
        .input('token', sql.VarBinary(256), matchedToken)
        .query(`SELECT mood_id FROM moods WHERE description = @desc AND sync_token = @token`);

      if (moodQuery.recordset.length > 0) {
        moodId = moodQuery.recordset[0].mood_id;
      } else {
        const moodResult = await pool.request().query('SELECT mood_id FROM moods');
        const ids = moodResult.recordset.map((row: any) => parseInt(row.mood_id.substring(1)));
        let next = 0;
        while (ids.includes(next)) next++;
        moodId = `M${next.toString().padStart(3, '0')}`;

        await pool.request()
          .input('mood_id', sql.Char(4), moodId)
          .input('desc', sql.VarChar(100), mood)
          .input('token', sql.VarBinary(256), matchedToken)
          .query(`INSERT INTO moods (mood_id, description, sync_token) VALUES (@mood_id, @desc, @token)`);
      }

      await pool.request()
        .input('entry_id', sql.Char(7), entryId)
        .input('entry_date', sql.Date, date)
        .input('journal_entry', sql.VarChar(8000), content)
        .input('mood_id', sql.Char(4), moodId)
        .input('token', sql.VarBinary(256), matchedToken)
        .query(`INSERT INTO entry_info (entry_id, entry_date, journal_entry, mood_id, sync_token) VALUES (@entry_id, @entry_date, @journal_entry, @mood_id, @token)`);
    }

    // Process habits
    const habitNames = habits ? habits.split(',').map(h => h.trim().split(':')[0]) : [];

    for (const name of habitNames) {
      if (!name) continue;

      const habitQuery = await pool.request()
        .input('desc', sql.VarChar(100), name)
        .input('token', sql.VarBinary(256), matchedToken)
        .query(`SELECT habit_id FROM habit WHERE description = @desc AND sync_token = @token`);

      if (habitQuery.recordset.length === 0) {
        continue;
      }

      const habitId = habitQuery.recordset[0].habit_id;

      await pool.request()
        .input('entry_id', sql.Char(7), entryId)
        .input('habit_id', sql.Char(3), habitId)
        .query(`INSERT INTO present_habits (entry_id, habit_id) VALUES (@entry_id, @habit_id)`);
    }

    return NextResponse.json({ success: true, message: 'Entry synced successfully' });
  } catch (err: any) {
    console.error('Error syncing entry:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
