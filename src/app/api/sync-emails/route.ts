import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { corsair } from "@/corsair";
import { db } from "@/db";
import { emails } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch latest 10 messages metadata from Gmail
    const listResponse = await corsair.gmail.api.messages.list({ maxResults: 10 });
    
    if (!listResponse?.messages) {
      return NextResponse.json({ success: true, count: 0 });
    }

    let syncedCount = 0;

    // Fetch details for each message and save to DB
    for (const msg of listResponse.messages) {
      if (!msg.id) continue;

      // Check if we already have this email
      const existing = await db.query.emails.findFirst({
        where: eq(emails.corsairId, msg.id)
      });

      if (existing) continue;

      // Get full metadata
      const details = await corsair.gmail.api.messages.get({ 
        id: msg.id, 
        format: "metadata", 
        metadataHeaders: ["Subject", "From", "To"] 
      });

      const headers = details.payload?.headers || [];
      const subject = headers.find((h: { name?: string; value?: string | null }) => h.name === "Subject")?.value || "No Subject";
      const from = headers.find((h: { name?: string; value?: string | null }) => h.name === "From")?.value || "Unknown";
      const to = headers.find((h: { name?: string; value?: string | null }) => h.name === "To")?.value || session.user.email || "Me";
      
      const internalDate = details.internalDate 
        ? new Date(Number(details.internalDate)) 
        : new Date();

      await db.insert(emails).values({
        corsairId: msg.id,
        threadId: msg.threadId || msg.id,
        subject,
        snippet: details.snippet || "",
        bodyText: details.snippet || "",
        fromAddress: from,
        toAddress: to,
        date: internalDate,
        userId: session.user.id,
        isRead: false,
        isArchived: false,
      });

      syncedCount++;
    }

    return NextResponse.json({ success: true, count: syncedCount });
  } catch (error: unknown) {
    console.error("Error syncing emails:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
