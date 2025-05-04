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
    const { habitName, positive, active, token } = await req.json();

    if (!habitName || token === undefined) {
      return NextResponse.json({ success: false, error: 'Missing required habit data' }, { status: 400 });
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

    // Check if habit already exists
    const habitQuery = await pool.request()
      .input('desc', sql.VarChar(100), habitName)
      .input('token', sql.VarBinary(256), matchedToken)
      .query(`SELECT habit_id FROM habit WHERE description = @desc AND sync_token = @token`);

    if (habitQuery.recordset.length > 0) {
      // Update existing habit
      await pool.request()
        .input('desc', sql.VarChar(100), habitName)
        .input('status', sql.Bit, active ? 1 : 0)
        .input('negative', sql.Bit, positive ? 0 : 1)
        .input('token', sql.VarBinary(256), matchedToken)
        .query(`
          UPDATE habit
          SET habit_status = @status, negative_habit = @negative
          WHERE description = @desc AND sync_token = @token
        `);
    } else {
      // Insert new habit
      const habitResult = await pool.request().query('SELECT habit_id FROM habit');
      const ids = habitResult.recordset.map(r => parseInt(r.habit_id.substring(1)));
      let next = 0;
      while (ids.includes(next)) next++;
      const newHabitId = `H${next.toString().padStart(3, '0')}`;

      await pool.request()
        .input('habit_id', sql.Char(3), newHabitId)
        .input('desc', sql.VarChar(100), habitName)
        .input('status', sql.Bit, active ? 1 : 0)
        .input('negative', sql.Bit, positive ? 0 : 1)
        .input('token', sql.VarBinary(256), matchedToken)
        .query(`
          INSERT INTO habit (habit_id, description, habit_status, negative_habit, sync_token)
          VALUES (@habit_id, @desc, @status, @negative, @token)
        `);
    }

    return NextResponse.json({ success: true, message: 'Habit synced successfully' });

  } catch (err: any) {
    console.error('Error syncing habit:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
