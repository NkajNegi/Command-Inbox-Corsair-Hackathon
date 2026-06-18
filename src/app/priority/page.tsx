import InboxClient from "@/components/InboxClient";
import { type Email } from "@/components/EmailList";
import { db } from "@/db";
import { emails } from "@/db/schema";
import { desc, gte, eq, and } from "drizzle-orm";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const revalidate = 0; 

export default async function PriorityPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }

  let dbEmails: (typeof emails.$inferSelect)[] = [];
  try {
    dbEmails = await db
      .select()
      .from(emails)
      .where(
        and(
          eq(emails.isArchived, false),
          eq(emails.userId, session.user.id!),
          gte(emails.priorityScore, 0.8)
        )
      )
      .orderBy(desc(emails.date))
      .limit(50);
  } catch (error) {
    console.error("Database connection failed.", error);
  }

  let mappedEmails: Email[] = dbEmails.map(e => ({
    id: e.id,
    subject: e.subject,
    from: e.fromAddress,
    snippet: e.snippet || "",
    date: e.date,
    read: e.isRead,
    priority: e.priorityScore ?? 0
  }));

  if (mappedEmails.length === 0) {
    mappedEmails = [
      {
        id: "demo-priority-1",
        subject: "No High Priority Emails Yet",
        from: "system@corsair.dev",
        snippet: "When an email comes in via webhook, our Groq AI Agent will score it. If the score is >= 0.8, it shows up here!",
        date: new Date(),
        read: false,
        priority: 0.99
      }
    ];
  }

  return <InboxClient initialEmails={mappedEmails} session={session} />;
}
