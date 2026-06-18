import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { emails } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, action } = await req.json();
    if (!id || !action) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    if (action === "archive") {
      const emailRecord = await db.query.emails.findFirst({
        where: and(eq(emails.id, id), eq(emails.userId, session.user.id))
      });

      if (emailRecord?.corsairId) {
        const account = await db.query.accounts.findFirst({
          where: (accounts, { and, eq }) => and(eq(accounts.userId, session.user!.id!), eq(accounts.provider, "google"))
        });

        if (account?.access_token) {
          await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${emailRecord.corsairId}/modify`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${account.access_token}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ removeLabelIds: ["INBOX"] })
          });
        }
      }

      await db
        .update(emails)
        .set({ isArchived: true })
        .where(and(eq(emails.id, id), eq(emails.userId, session.user.id)));
      
      console.log(`[Email Action] Archived email: ${id} for user: ${session.user.id}`);
      return NextResponse.json({ success: true, message: "Email archived successfully" });
    } 
    
    if (action === "delete") {
      const emailRecord = await db.query.emails.findFirst({
        where: and(eq(emails.id, id), eq(emails.userId, session.user.id))
      });

      if (emailRecord?.corsairId) {
        const account = await db.query.accounts.findFirst({
          where: (accounts, { and, eq }) => and(eq(accounts.userId, session.user!.id!), eq(accounts.provider, "google"))
        });

        if (account?.access_token) {
          await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${emailRecord.corsairId}/trash`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${account.access_token}`
            }
          });
        }
      }

      await db
        .delete(emails)
        .where(and(eq(emails.id, id), eq(emails.userId, session.user.id)));
      
      console.log(`[Email Action] Deleted email: ${id} for user: ${session.user.id}`);
      return NextResponse.json({ success: true, message: "Email deleted successfully" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    const err = error as Error;
    console.error("Error performing email action:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
