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

/**
 * Fetches all entries, moods, and habits for the given token
 * If the token is valid, it retrieves all linked journal entries
 * and their associated moods and habits.
 *
 * @param req - Next.js request object containing the sync token.
 * @returns NextResponse with the fetched entries in JSON format.
 */
export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    console.log(" Received Token for Fetch:", token);

    if (!token) {
      console.error("Token is missing!");
      return NextResponse.json({ success: false, error: 'Token is required.' }, { status: 400 });
    }

    const pool = await getConnection();
    console.log("Connected to the database.");

    // Fetch all possible tokens
    const tokenResult = await pool.request()
      .query(`SELECT sync_token FROM account_info`);
    
    const tokenList = tokenResult.recordset.map((row: any) => row.sync_token);

    //Compare each one with bcrypt
    let matchedToken: Buffer | null = null;
    for (const dbToken of tokenList) {
      const dbHash = dbToken.toString(); // Convert buffer to string
      const isMatch = await bcrypt.compare(token, dbHash);
      console.log(`Comparing ${token} with ${dbHash} → ${isMatch}`);

      if (isMatch) {
        matchedToken = dbToken;
        break;
      }
    }

    if (!matchedToken) {
      console.error(" No matching token found in the database.");
      return NextResponse.json({ success: false, error: 'Invalid token.' }, { status: 401 });
    }

    console.log(" Matched Token Found:", matchedToken);

    //Fetch all entries with that token
    const entriesResult = await pool.request()
      .input('token', sql.VarBinary(256), matchedToken)
      .query(`
          SELECT ei.entry_id, ei.entry_date AS date, ei.journal_entry AS content, m.description AS mood
          FROM entry_info ei
          LEFT JOIN moods m ON ei.mood_id = m.mood_id
          WHERE ei.sync_token = @token
      `);

    console.log("Fetched Entries:", entriesResult.recordset);

    const entries = entriesResult.recordset.map((entry: any) => ({
        ...entry,
        date: new Date(entry.date).toLocaleDateString('en-US'), // Format the date to MM/DD/YYYY
      }));
      

    // Fetch all habits associated with each entry
    for (const entry of entries) {
      console.log("Fetching habits for Entry ID:", entry.entry_id);
      const habitsResult = await pool.request()
        .input('entry_id', sql.Char(7), entry.entry_id)
        .query(`
            SELECT h.description AS name, h.habit_status AS active, h.negative_habit AS positive
            FROM present_habits ph
            JOIN habit h ON ph.habit_id = h.habit_id
            WHERE ph.entry_id = @entry_id
        `);

      console.log(" Habits fetched for Entry ID:", entry.entry_id, "→", habitsResult.recordset);

      entry.habits = habitsResult.recordset.map((habit: any) => ({
        name: habit.name,
        active: habit.active === 1,
        positive: habit.positive === 0
      }));
    }

    console.log(" Final Database Result with Habits:", JSON.stringify(entries, null, 2));

    return NextResponse.json({
      success: true,
      entries: entries
    });

  } catch (err: any) {
    console.error(' Database fetch error:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
