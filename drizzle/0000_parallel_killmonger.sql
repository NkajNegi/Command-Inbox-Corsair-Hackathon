CREATE TABLE "emails" (
	"id" text PRIMARY KEY NOT NULL,
	"corsair_id" text,
	"thread_id" text,
	"subject" text NOT NULL,
	"snippet" text,
	"body_text" text,
	"body_html" text,
	"from_address" text NOT NULL,
	"to_address" text NOT NULL,
	"date" timestamp NOT NULL,
	"priority_score" double precision,
	"is_read" boolean DEFAULT false NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"embedding" vector(1536),
	CONSTRAINT "emails_corsair_id_unique" UNIQUE("corsair_id")
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" text PRIMARY KEY NOT NULL,
	"corsair_id" text,
	"summary" text NOT NULL,
	"description" text,
	"location" text,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"organizer" text,
	"attendees_raw" text,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "events_corsair_id_unique" UNIQUE("corsair_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "emails" ADD CONSTRAINT "emails_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "embeddingIndex" ON "emails" USING hnsw ("embedding" vector_cosine_ops);