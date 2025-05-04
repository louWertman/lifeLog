// This route handles user signup by accepting a sync token from the frontend,
// or generating one if none is provided, then hashing it and storing it in the database.

import { NextRequest, NextResponse } from 'next/server'; // Next.js server APIs
import sql from 'mssql';           // Microsoft SQL Server client
import bcrypt from 'bcryptjs';     // Password hashing library (works in Next.js)
import crypto from 'crypto';       // Used to generate secure random tokens

// ---------- Database connection config ----------
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

// ---------- Connection pool for re-use ----------
let pool: sql.ConnectionPool | null = null;

async function getConnection() {
  if (!pool) {
    pool = await sql.connect(config); // connect to Azure SQL using config
  }
  return pool;
}

// ---------- POST handler for /api/signup ----------
export async function POST(req: NextRequest) {
  try {
    // Parse JSON body to get frontend-supplied token (if any)
    const body = await req.json();
    const rawToken = body.token ?? crypto.randomBytes(32).toString('hex');
    // If no token was provided, generate a secure random one (32 bytes = 256 bits)

    // Hash the raw token using bcryptjs
    const hashedToken = await bcrypt.hash(rawToken, 10);
    // Salt rounds = 10 → strong enough for login purposes without huge CPU cost

    // Connect to database
    const pool = await getConnection();

    // Insert hashed token and sync = 1 into account_info table
    await pool.request()
      .input('sync_token', sql.VarBinary(256), Buffer.from(hashedToken)) // hashed token as binary
      .input('sync', sql.Bit, 1) // Set to 1 because this user wants to sync
      .query(`
        INSERT INTO account_info (sync_token, sync)
        VALUES (@sync_token, @sync)
      `);

    // Return the raw token to the frontend (to store in settings.json)
    return NextResponse.json({
      success: true,
      token: rawToken
    });

  } catch (err: any) {
    // Catch and return error details for debugging
    console.error('Signup error:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
