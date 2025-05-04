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
  if (!pool) {
    pool = await sql.connect(config);
  }
  return pool;
}

// DELETE Habit API
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { habitName, token } = body;

    if (!habitName || !token) {
      return NextResponse.json({ success: false, error: 'Missing required data' }, { status: 400 });
    }

    const pool = await getConnection();

    // Validate token (ensure user is authenticated)
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

    // Get the habit_id using description + sync_token to match this user's habit
    const habitResult = await pool.request()
      .input('habit_name', sql.VarChar(100), habitName)
      .input('token', sql.VarBinary(255), matchedToken)
      .query(`
        SELECT habit_id 
        FROM habit 
        WHERE description = @habit_name AND sync_token = @token
      `);

    if (habitResult.recordset.length === 0) {
      return NextResponse.json({ success: false, error: 'Habit not found in habit table' }, { status: 404 });
    }

    const habitId = habitResult.recordset[0].habit_id;

    // Try to delete from present_habits, but don't fail if not found
    const entryResult = await pool.request()
      .input('habit_id', sql.Char(3), habitId)
      .query(`
        SELECT entry_id
        FROM present_habits
        WHERE habit_id = @habit_id
      `);

    if (entryResult.recordset.length === 0) {
      console.log(`No present_habits found for habit_id '${habitId}', skipping that deletion.`);
    } else {
      const entryId = entryResult.recordset[0].entry_id;

      await pool.request()
        .input('habit_id', sql.Char(3), habitId)
        .input('entry_id', sql.Char(7), entryId)
        .query(`
          DELETE FROM present_habits 
          WHERE habit_id = @habit_id AND entry_id = @entry_id
        `);
      console.log(`Deleted from present_habits where habit_id = '${habitId}'`);
    }

    // Always try to delete from habit table if it's no longer in present_habits
    await pool.request()
      .input('habit_id', sql.Char(3), habitId)
      .query(`
        DELETE FROM habit
        WHERE habit_id = @habit_id
        AND NOT EXISTS (SELECT 1 FROM present_habits WHERE habit_id = @habit_id)
      `);

    return NextResponse.json({ success: true, message: 'Habit deleted successfully if present' });

  } catch (err: any) {
    console.error('Error deleting habit:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
