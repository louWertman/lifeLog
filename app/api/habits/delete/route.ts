/**
 * Author: Dyllan Burgos  
 * Professor: Charlie Shim  
 * File Purpose: API route to handle deletion of habits from the database.  
 *               This route authenticates using a token, removes the habit from `present_habits`,
 *               and deletes the habit itself from the `habit` table if no remaining references exist.
 */

import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';
import bcrypt from 'bcryptjs';

// MSSQL configuration using environment variables
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

/**
 * Initializes or reuses a single MSSQL connection pool.
 * returns {Promise<sql.ConnectionPool>} A connected pool object.
 */
async function getConnection() {
  if (!pool) {
    pool = await sql.connect(config);
  }
  return pool;
}

/**
 * DELETE /api/habits/delete
 * Deletes a habit from the database if no related records exist in present_habits.
 * Validates the user token and ensures proper habit identification.
 * 
 * param {NextRequest} req - Incoming DELETE request with habitName and token in body.
 * returns {NextResponse} Success or error response.
 */
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { habitName, token } = body;

    if (!habitName || !token) {
      return NextResponse.json({ success: false, error: 'Missing required data' }, { status: 400 });
    }

    const pool = await getConnection();

    // Step 1: Validate sync token
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

    // Step 2: Fetch habit ID using the name and token
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

    // Step 3: Delete references in present_habits
    await pool.request()
      .input('habit_id', sql.Char(3), habitId)
      .query(`
        DELETE FROM present_habits 
        WHERE habit_id = @habit_id
      `);

    console.log(`Deleted all present_habits rows for habit_id = '${habitId}'`);

    // Step 4: Attempt to delete the habit if not referenced
    await pool.request()
      .input('habit_id', sql.Char(3), habitId)
      .query(`
        DELETE FROM habit
        WHERE habit_id = @habit_id
        AND NOT EXISTS (SELECT 1 FROM present_habits WHERE habit_id = @habit_id)
      `);

    // Step 5: Confirm if the habit still exists
    const habitStillExists = await pool.request()
      .input('habit_id', sql.Char(3), habitId)
      .query('SELECT 1 FROM habit WHERE habit_id = @habit_id');

    if (habitStillExists.recordset.length > 0) {
      console.log(`Habit '${habitId}' was not deleted because it's still referenced or locked.`);
    }

    return NextResponse.json({ success: true, message: 'Habit deleted successfully if present' });

  } catch (err: any) {
    console.error('Error deleting habit:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
