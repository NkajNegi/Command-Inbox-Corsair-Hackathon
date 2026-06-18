import { createCorsair } from "corsair";
import { pool } from "@/db";
import { gmail } from "@corsair-dev/gmail";
import { googlecalendar } from "@corsair-dev/googlecalendar";

// Ensure environment variables are loaded if necessary.
// KEK is usually read automatically from process.env.CORSAIR_KEK by Corsair setup.

export const corsair = createCorsair({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  database: pool as any, // Neon Serverless Pool
  kek: process.env.CORSAIR_KEK || "dummy-kek-if-missing-in-build",
  plugins: [gmail(), googlecalendar()],
});
