import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import { createCorsair } from 'corsair';
import { gmail } from '@corsair-dev/gmail';

dotenv.config();

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  try {
    const users = await db.execute('SELECT id, email FROM "user"');
    if (users.rows.length === 0) {
      console.log("No users found.");
      return;
    }

    const testUser = users.rows[0];
    console.log("Testing with user:", testUser.email, testUser.id);

    const corsair = createCorsair({
      database: pool as any,
      kek: process.env.CORSAIR_KEK || "dummy-kek-if-missing-in-build",
      plugins: [gmail()],
    });

    console.log("Fetching emails for tenant...");
    const listResponse = await corsair.gmail.api.messages.list(
      { maxResults: 1 },
      { tenantId: testUser.id }
    );
    console.log("List Response:", listResponse);

  } catch (e: any) {
    console.error("FAILED:", e.message || e);
    if (e.response) {
      console.error(await e.response.text());
    }
  } finally {
    await pool.end();
  }
}

main();
