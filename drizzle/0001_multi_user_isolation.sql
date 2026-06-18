ALTER TABLE "emails" DROP CONSTRAINT IF EXISTS "emails_corsair_id_unique";
--> statement-breakpoint
ALTER TABLE "events" DROP CONSTRAINT IF EXISTS "events_corsair_id_unique";
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "emails_user_corsair_id_unique" ON "emails" ("user_id", "corsair_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "emails_user_inbox_idx" ON "emails" ("user_id", "is_archived", "date");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "emails_user_priority_idx" ON "emails" ("user_id", "is_archived", "priority_score");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "events_user_corsair_id_unique" ON "events" ("user_id", "corsair_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "events_user_future_idx" ON "events" ("user_id", "end_time");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "events_user_priority_idx" ON "events" ("user_id", "priority_score");
