import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { events } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, title, date, time, attendees, location, sendInvites } = body;

    // We need to fetch the event from DB to get the corsairId
    const dbEvent = await db.query.events.findFirst({
      where: and(eq(events.id, id), eq(events.userId, session.user.id))
    });

    if (!dbEvent || !dbEvent.corsairId) {
      return NextResponse.json({ error: "Event not found or not synced with Google Calendar" }, { status: 404 });
    }

    // Construct start/end dates
    const startDateTime = new Date(`${date}T${time}`);
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // +1 hour

    const shouldSendInvites = Boolean(sendInvites && attendees);
    const attendeesList = shouldSendInvites
      ? attendees.split(',').map((email: string) => ({ email: email.trim() })).filter((guest: { email: string }) => guest.email.length > 0)
      : [];

    const account = await db.query.accounts.findFirst({
      where: (accounts, { and, eq }) => and(eq(accounts.userId, session.user!.id!), eq(accounts.provider, "google"))
    });

    let updateResponse;

    if (account?.access_token) {
      const token = account.access_token;
      
      const sendUpdates = shouldSendInvites ? "all" : "none";
      const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${dbEvent.corsairId}?sendUpdates=${sendUpdates}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          summary: title,
          location: location || "",
          start: { dateTime: startDateTime.toISOString() },
          end: { dateTime: endDateTime.toISOString() },
          ...(attendeesList.length > 0 ? { attendees: attendeesList } : {})
        })
      });

      if (res.ok) {
        updateResponse = await res.json();
      } else {
        console.warn("Actual Google Calendar update failed:", await res.text());
        return NextResponse.json({ error: "Failed to update event in Google Calendar" }, { status: 500 });
      }
    } else {
      console.warn("No Google access token found, skipping actual Google Calendar update");
    }

    // Update in local DB
    await db.update(events).set({
      summary: title,
      location: location || "",
      startTime: startDateTime,
      endTime: endDateTime,
      attendeesRaw: shouldSendInvites ? attendees : ""
    }).where(and(eq(events.id, id), eq(events.userId, session.user.id)));

    return NextResponse.json({ success: true, event: updateResponse });
  } catch (error) {
    const err = error as Error;
    console.error("Error updating event:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
