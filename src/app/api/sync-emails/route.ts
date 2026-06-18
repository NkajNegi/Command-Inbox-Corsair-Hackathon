import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { emails } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Since this is a Hackathon and Corsair OAuth isn't wired up to a UI link button,
    // we use the NextAuth Google access token which has the correct mail scopes!
    const account = await db.query.accounts.findFirst({
      where: (accounts, { and, eq }) => and(eq(accounts.userId, session.user!.id!), eq(accounts.provider, "google"))
    });

    if (!account?.access_token) {
      console.warn("No Google access token found for user");
      return NextResponse.json({ success: true, count: 0, unlinked: true });
    }

    const token = account.access_token;

    // Fetch message IDs
    const listRes = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=50", {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!listRes.ok) {
      console.error("Gmail API list error:", await listRes.text());
      return NextResponse.json({ success: true, count: 0, unlinked: true });
    }

    const listData = await listRes.json();
    if (!listData.messages) {
      return NextResponse.json({ success: true, count: 0 });
    }

    let syncedCount = 0;

    // Fetch details for each message and save to DB
    for (const msg of listData.messages) {
      try {
        if (!msg.id) continue;

        // Check if we already have this email
        const existing = await db.query.emails.findFirst({
          where: eq(emails.corsairId, msg.id)
        });

        if (existing) continue;

        // Fetch full metadata
        const detailsRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=To`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!detailsRes.ok) continue;

        const details = await detailsRes.json();

        const headers = details.payload?.headers || [];
        const subject = headers.find((h: { name: string; value: string }) => h.name === "Subject")?.value || "No Subject";
        const from = headers.find((h: { name: string; value: string }) => h.name === "From")?.value || "Unknown";
        const to = headers.find((h: { name: string; value: string }) => h.name === "To")?.value || session.user.email || "Me";
        
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
      } catch (innerError) {
        console.error(`Failed to process message ${msg.id}:`, innerError);
      }
    }

    return NextResponse.json({ success: true, count: syncedCount });
  } catch (error: unknown) {
    console.error("Error syncing emails:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
