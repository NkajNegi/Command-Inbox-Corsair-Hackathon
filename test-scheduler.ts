import { db } from "./src/db/index.js";
import { executeScheduleEvent } from "./src/lib/eventScheduler.js";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

async function test() {
  try {
    // We pass a dummy user ID that must exist in `users`.
    const userId = "c1861614-b8b8-4e3a-9e12-320c2d334582"; // Need a real user ID. I'll get it from db.
    const userResult = await db.query.users.findFirst();
    if (!userResult) {
      console.log("No users found");
      return;
    }
    
    console.log("Using user ID:", userResult.id);

    const result = await executeScheduleEvent(
      undefined, // token
      userResult.id,
      "Dinner with Ashish",
      "2026-06-19",
      "18:00",
      "",
      "medium"
    );
    console.log(result);
  } catch (e) {
    console.error("Test Error:", e);
  }
}
test();
