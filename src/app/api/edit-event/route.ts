import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { corsair } from "@/corsair";
import { db } from "@/db";
import { events } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, title, date, time, attendees, location } = body;

    // We need to fetch the event from DB to get the corsairId
    const dbEvent = await db.query.events.findFirst({
      where: eq(events.id, id)
    });

    if (!dbEvent || !dbEvent.corsairId) {
      return NextResponse.json({ error: "Event not found or not synced with Google Calendar" }, { status: 404 });
    }

    // Construct start/end dates
    const startDateTime = new Date(`${date}T${time}`);
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // +1 hour

    const attendeesList = attendees ? attendees.split(',').map((email: string) => ({ email: email.trim() })) : [];

    // Update in Google Calendar via Corsair
    const updateResponse = await corsair.googlecalendar.api.events.update({
      calendarId: "primary",
      id: dbEvent.corsairId,
      event: {
        summary: title,
        location: location || "",
        start: { dateTime: startDateTime.toISOString() },
        end: { dateTime: endDateTime.toISOString() },
        attendees: attendeesList
      }
    });

    // Update in local DB
    await db.update(events).set({
      summary: title,
      location: location || "",
      startTime: startDateTime,
      endTime: endDateTime,
      attendeesRaw: attendees || ""
    }).where(eq(events.id, id));

    return NextResponse.json({ success: true, event: updateResponse });
  } catch (error) {
    const err = error as Error;
    console.error("Error updating event:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
