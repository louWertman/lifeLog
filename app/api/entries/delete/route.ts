/**
 * Author: Dyllan Burgos
 * Professor: Charlie Shim
 *
 * Purpose: Handles DELETE requests to remove a journal entry and its associated habits
 * from the database. Validates a sync token, finds the corresponding entry_id,
 * deletes any present_habits rows, and finally deletes the entry_info row.
 */

import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';
import bcrypt from 'bcryptjs';

// ---------- Database Configuration ----------
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

// ---------- Database Connection Pool ----------
let pool: sql.ConnectionPool | null = null;

/**
 * Get or establish a SQL connection.
 */
async function getConnection() {
  if (!pool) pool = await sql.connect(config);
  return pool;
}

/**
 * DELETE Handler - Remove a journal entry and its associated habits.
 * 
 * Request body:
 * - date: string (e.g., "2025-05-04")
 * - token: string (user's sync token)
 * 
 * Returns:
 * - 200 OK: Entry and associated habits deleted
 * - 400 Bad Request: Missing parameters
 * - 401 Unauthorized: Invalid sync token
 * - 404 Not Found: Entry does not exist
 * - 500 Internal Server Error: Unexpected failure
 */
export async function DELETE(req: NextRequest) {
  try {
    const { date, token } = await req.json();

    if (!date || !token) {
      return NextResponse.json({ success: false, error: 'Missing required data' }, { status: 400 });
    }

    const pool = await getConnection();

    // ---------- Sync Token Validation ----------
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

    // ---------- Entry Lookup ----------
    const entryLookup = await pool.request()
      .input('date', sql.Date, date)
      .input('token', sql.VarBinary(256), matchedToken)
      .query(`SELECT entry_id FROM entry_info WHERE entry_date = @date AND sync_token = @token`);

    if (entryLookup.recordset.length === 0) {
      return NextResponse.json({ success: false, error: 'Entry not found' }, { status: 404 });
    }

    const entryId = entryLookup.recordset[0].entry_id;

    // ---------- Delete from present_habits ----------
    await pool.request()
      .input('entry_id', sql.Char(7), entryId)
      .query(`DELETE FROM present_habits WHERE entry_id = @entry_id`);

    // ---------- Delete from entry_info ----------
    await pool.request()
      .input('entry_id', sql.Char(7), entryId)
      .query(`DELETE FROM entry_info WHERE entry_id = @entry_id`);

    return NextResponse.json({ success: true, message: `Entry ${entryId} deleted.` });

  } catch (err: any) {
    console.error('Error deleting entry:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
