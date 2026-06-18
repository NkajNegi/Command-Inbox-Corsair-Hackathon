import { Pool } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    await pool.query('ALTER TABLE IF EXISTS "users" RENAME TO "user"');
    await pool.query('ALTER TABLE IF EXISTS "accounts" RENAME TO "account"');
    await pool.query('ALTER TABLE IF EXISTS "sessions" RENAME TO "session"');
    console.log("Successfully renamed tables to singular format!");
  } catch (e) {
    console.error("Failed to rename tables:", e);
  } finally {
    await pool.end();
  }
}

main();
