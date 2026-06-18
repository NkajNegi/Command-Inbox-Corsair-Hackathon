import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import { sql } from 'drizzle-orm';

dotenv.config();

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);
  
  try {
    const tables = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log("Tables in Neon DB:", tables.rows.map(r => r.table_name).join(", "));
  } catch (e) {
    console.error("Failed to query DB:", e);
  } finally {
    await pool.end();
  }
}

main();
