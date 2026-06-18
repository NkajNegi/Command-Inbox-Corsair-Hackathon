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
      await db
        .update(emails)
        .set({ isArchived: true })
        .where(and(eq(emails.id, id), eq(emails.userId, session.user.id)));
      
      console.log(`[Email Action] Archived email: ${id} for user: ${session.user.id}`);
      return NextResponse.json({ success: true, message: "Email archived successfully" });
    } 
    
    if (action === "delete") {
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
