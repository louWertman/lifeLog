/**
 * Author: Dyllan Burgos  
 * Professor: Charlie Shim  
 * File Purpose: API route to insert or update a habit in the database based on the description and user's sync token.
 *               If the habit doesn't exist, it creates a new one. If it does, it updates its status and positivity.
 */

import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';
import bcrypt from 'bcryptjs';

// SQL Server configuration using environment variables
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
 * Establishes or reuses a single SQL Server connection pool.
 * returns {Promise<sql.ConnectionPool>} A connected pool object.
 */
async function getConnection() {
  if (!pool) pool = await sql.connect(config);
  return pool;
}

/**
 * POST /api/habits/update
 * Inserts a new habit or updates an existing one tied to a specific sync token.
 * 
 * @param {NextRequest} req - HTTP request containing habitName, positive, active, and token in the body.
 * @returns {NextResponse} JSON response indicating success or failure.
 */
export async function POST(req: NextRequest) {
  try {
    const { habitName, positive, active, token } = await req.json();

    // Validate required fields
    if (!habitName || token === undefined) {
      return NextResponse.json({ success: false, error: 'Missing required habit data' }, { status: 400 });
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

    // Step 2: Check if habit already exists
    const habitQuery = await pool.request()
      .input('desc', sql.VarChar(100), habitName)
      .input('token', sql.VarBinary(256), matchedToken)
      .query(`SELECT habit_id FROM habit WHERE description = @desc AND sync_token = @token`);

    let habitId: string;

    // Step 3: If not exists, insert habit
    if (habitQuery.recordset.length === 0) {
      const habitIdResult = await pool.request().query('SELECT habit_id FROM habit');
      const habitIds = habitIdResult.recordset.map((row: any) => parseInt(row.habit_id));
      let nextHabitNum = 1;
      while (habitIds.includes(nextHabitNum)) nextHabitNum++;
      habitId = nextHabitNum.toString().padStart(3, '0');

      console.log('[Habit Insert Debug]', {
        habitId,
        habitName,
        positive,
        active,
        negative: positive ? 0 : 1,
        token: matchedToken?.toString('hex').slice(0, 10) + '...'
      });

      await pool.request()
        .input('habit_id', sql.Char(3), habitId)
        .input('desc', sql.VarChar(100), habitName)
        .input('status', sql.Bit, active ? 1 : 0)
        .input('negative', sql.Bit, positive ? 0 : 1)
        .input('token', sql.VarBinary(256), matchedToken)
        .query(`
          INSERT INTO habit (habit_id, description, habit_status, negative_habit, sync_token)
          VALUES (@habit_id, @desc, @status, @negative, @token)
        `);
    }

    // Step 4: Update the habit’s attributes regardless
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

    return NextResponse.json({ success: true, message: 'Habit synced successfully' });

  } catch (err: any) {
    console.error('Error syncing habit:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
