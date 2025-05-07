/**
 * Author: Dyllan Burgos  
 * Professor: Charlie Shim  
 * File Purpose: This API route handles user signup by accepting or generating a sync token,
 *               securely hashing it, and storing it in the `account_info` table in Azure SQL.
 *               The unhashed token is returned to the client for storage and future authentication.
 */

import { NextRequest, NextResponse } from 'next/server'; // Next.js server APIs
import sql from 'mssql';           // Microsoft SQL Server client
import bcrypt from 'bcryptjs';     // Password hashing library
import crypto from 'crypto';       // Used to generate secure random tokens

// ---------- Database connection configuration ----------
const config: sql.config = {
  user: process.env.DB_USER!,             
  password: process.env.DB_PASS!,
  server: process.env.DB_SERVER!,
  database: process.env.DB_NAME!,      
  options: {
    encrypt: true,                        // Required for Azure SQL
    trustServerCertificate: false,        // Do NOT skip cert check in production
  },
};

// ---------- Connection pool to reuse SQL connections ----------
let pool: sql.ConnectionPool | null = null;

/**
 * Establishes and caches a single connection pool to the database.
 * @returns {Promise<sql.ConnectionPool>} Connected SQL Server pool
 */
async function getConnection() {
  if (!pool) {
    pool = await sql.connect(config);
  }
  return pool;
}

/**
 * Handles user signup by inserting a hashed sync token into the database.
 * If no token is provided in the request, one is generated.
 * 
 * @param {NextRequest} req - The HTTP POST request from the client.
 * @returns {NextResponse} JSON response indicating success and returning the raw token.
 */
export async function POST(req: NextRequest) {
  try {
    // Grab token from client, or generate one
    const body = await req.json();
    const rawToken = body.token ?? crypto.randomBytes(32).toString('hex'); // 256-bit secure token

    // Hash the token using bcrypt (saltRounds = 10)
    const hashedToken = await bcrypt.hash(rawToken, 10);

    // Insert the hashed token into the database
    const pool = await getConnection();
    await pool.request()
      .input('sync_token', sql.VarBinary(256), Buffer.from(hashedToken))
      .input('sync', sql.Bit, 1)
      .query(`
        INSERT INTO account_info (sync_token, sync)
        VALUES (@sync_token, @sync)
      `);

    // Return raw token to client (stored in settings.json for future requests)
    return NextResponse.json({
      success: true,
      token: rawToken
    });

  } catch (err: any) {
    console.error('Signup error:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
