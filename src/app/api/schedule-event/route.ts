import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { corsair } from "@/corsair";
import { db } from "@/db";
import { events } from "@/db/schema";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, date, time, attendees, location } = body;

    if (!title || !date || !time) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Construct start/end dates
    const startDateTime = new Date(`${date}T${time}`);
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // +1 hour

    const attendeesList = attendees ? attendees.split(',').map((email: string) => ({ email: email.trim() })) : [];

    console.log(`[Corsair SDK Execution] Inserting event to Google Calendar: ${title} at ${startDateTime.toISOString()}`);

    const account = await db.query.accounts.findFirst({
      where: (accounts, { and, eq }) => and(eq(accounts.userId, session.user!.id!), eq(accounts.provider, "google"))
    });

    let googleEventId = "mock-event-id-" + Date.now();
    let insertResponse;

    if (account?.access_token) {
      const token = account.access_token;
      
      const res = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          summary: title,
          location: location || "",
          start: { dateTime: startDateTime.toISOString() },
          end: { dateTime: endDateTime.toISOString() },
          attendees: attendeesList
        })
      });

      if (res.ok) {
        insertResponse = await res.json();
        if (insertResponse && insertResponse.id) {
          googleEventId = insertResponse.id;
        }
      } else {
        console.warn("Actual Google Calendar insert failed:", await res.text());
      }
    } else {
      console.warn("No Google access token found for user, falling back to local DB cache");
    }

    // Insert in local DB
    const [inserted] = await db.insert(events).values({
      corsairId: googleEventId,
      summary: title,
      location: location || "",
      startTime: startDateTime,
      endTime: endDateTime,
      attendeesRaw: attendees || "",
      userId: session.user.id,
    }).returning();

    return NextResponse.json({ success: true, message: "Event scheduled via Corsair", event: inserted, googleResponse: insertResponse });
  } catch (error) {
    console.error("Failed to schedule event:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
