import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL!);

async function run() {
  console.log(await sql`SELECT * FROM account WHERE "userId" = '6b2f01a5-e85e-425d-be74-8062b8052c66'`);
}

run().catch(console.error);
