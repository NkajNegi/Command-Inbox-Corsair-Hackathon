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
  corsairIdPrefix: string = "agent-event-id-"
) {
  const startDateTime = new Date(`${date}T${time}`);
  const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // 1 hour duration
  const attendeesList = attendees ? attendees.split(',').map((email: string) => ({ email: email.trim() })) : [];

  let googleEventId = corsairIdPrefix + Date.now();
  try {
    if (accessToken) {
      const res = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
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
          attendees: attendeesList
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

  // Insert in local DB
  await db.insert(events).values({
    corsairId: googleEventId,
    summary: title,
    location: "",
    startTime: startDateTime,
    endTime: endDateTime,
    attendeesRaw: attendees || "",
    priorityScore: priorityScore,
    userId: userId,
  });

  return { success: true, message: `Calendar event scheduled and cached locally with ${priority} priority`, eventId: googleEventId };
}
