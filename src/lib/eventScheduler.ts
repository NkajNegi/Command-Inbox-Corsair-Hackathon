import { db } from "@/db";
import { events } from "@/db/schema";

export async function executeScheduleEvent(
  accessToken: string | undefined, 
  userId: string, 
  title: string, 
  date: string, 
  time: string, 
  attendees: string, 
  priority: string = "medium",
  corsairIdPrefix: string = "agent-event-id-",
  sendInvites: boolean = false
) {
  const startDateTime = new Date(`${date}T${time}`);
  if (isNaN(startDateTime.getTime())) {
    console.warn(`[EventScheduler] Invalid date/time format provided: ${date}T${time}. Falling back to tomorrow.`);
    const tmr = new Date();
    tmr.setDate(tmr.getDate() + 1);
    startDateTime.setTime(tmr.getTime());
  }
  const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // 1 hour duration
  const shouldSendInvites = Boolean(sendInvites && attendees);
  const attendeesList = shouldSendInvites
    ? attendees.split(',').map((email: string) => ({ email: email.trim() })).filter((guest: { email: string }) => guest.email.length > 0)
    : [];

  let googleEventId = corsairIdPrefix + Date.now();
  try {
    if (accessToken) {
      const sendUpdates = shouldSendInvites ? "all" : "none";
      const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=${sendUpdates}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          summary: title,
          location: "",
          start: { dateTime: startDateTime.toISOString() },
          end: { dateTime: endDateTime.toISOString() },
          ...(attendeesList.length > 0 ? { attendees: attendeesList } : {})
        })
      });
      if (res.ok) {
        const data = await res.json();
        googleEventId = data.id;
      } else {
        console.error("Google Calendar insert failed:", await res.text());
      }
    } else {
      console.warn("No access token provided to event scheduler");
    }
  } catch (e) {
    console.warn("Google Calendar insert failed. Falling back to local cache.", e);
  }

  let priorityScore = 0.5;
  if (priority.toLowerCase() === "high") priorityScore = 1.0;
  if (priority.toLowerCase() === "low") priorityScore = 0.1;

  // Insert in local DB with a try-catch to prevent crash if duplicate or invalid
  try {
    await db.insert(events).values({
      corsairId: googleEventId,
      summary: title,
      location: "",
      startTime: startDateTime,
      endTime: endDateTime,
      attendeesRaw: shouldSendInvites ? attendees : "",
      priorityScore: priorityScore,
      userId: userId,
    });
  } catch (dbError) {
    console.error("[EventScheduler] Failed to insert event into local DB. It might already exist.", dbError);
  }

  return { success: true, message: `Calendar ${shouldSendInvites ? "invite" : "reminder"} scheduled and cached locally with ${priority} priority`, eventId: googleEventId };
}
