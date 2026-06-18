import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { corsair } from "@/corsair";
import { db } from "@/db";
import { events } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch next 50 upcoming events
    const listResponse = await corsair.googlecalendar.api.events.getMany({ 
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      maxResults: 50,
      singleEvents: true,
      orderBy: "startTime"
    });
    
    if (!listResponse?.items) {
      return NextResponse.json({ success: true, count: 0 });
    }

    let syncedCount = 0;

    for (const event of listResponse.items) {
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
