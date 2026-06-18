import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { events } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getValidAccessToken } from "@/lib/googleAuth";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = await getValidAccessToken(session.user.id);
    if (!token) {
      console.warn("No valid or refreshable Google access token found for user");
      return NextResponse.json({ success: true, count: 0, unlinked: true });
    }
    const timeMin = new Date().toISOString();
    
    const listRes = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&maxResults=10&singleEvents=true&orderBy=startTime`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!listRes.ok) {
      console.error("Calendar API list error:", await listRes.text());
      return NextResponse.json({ success: true, count: 0, unlinked: true });
    }

    const listData = await listRes.json();
    
    if (!listData.items) {
      return NextResponse.json({ success: true, count: 0 });
    }

    let syncedCount = 0;

    for (const event of listData.items) {
      if (!event.id || !event.start?.dateTime || !event.end?.dateTime) continue;

      const existing = await db.query.events.findFirst({
        where: eq(events.corsairId, event.id)
      });

      if (existing) continue;

      await db.insert(events).values({
        corsairId: event.id,
        summary: event.summary || "Untitled Event",
        description: event.description || "",
        startTime: new Date(event.start.dateTime),
        endTime: new Date(event.end.dateTime),
        location: event.location || "",
        attendeesRaw: event.attendees?.map((a: { email?: string | null }) => a.email).join(",") || "",
        userId: session.user.id,
      });

      syncedCount++;
    }

    return NextResponse.json({ success: true, count: syncedCount });
  } catch (error: unknown) {
    console.error("Error syncing events:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
