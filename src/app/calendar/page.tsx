import CalendarClient from "@/components/CalendarClient";
import { type CalendarEvent } from "@/components/EventList";
import { db } from "@/db";
import { events } from "@/db/schema";
import { desc } from "drizzle-orm";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const revalidate = 0;

export default async function CalendarPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }

  let dbEvents: (typeof events.$inferSelect)[] = [];
  try {
    dbEvents = await db.select().from(events).orderBy(desc(events.startTime)).limit(50);
  } catch (error) {
    console.error("Database connection failed.", error);
  }

  let mappedEvents: CalendarEvent[] = dbEvents.map(e => ({
    id: e.id,
    title: e.summary,
    start: e.startTime,
    end: e.endTime,
    location: e.location || "TBD",
    attendees: e.attendeesRaw ? e.attendeesRaw.split(",") : []
  }));

  if (mappedEvents.length === 0) {
    mappedEvents = [
      {
        id: "demo-cal-1",
        title: "Awaiting Corsair Webhooks",
        start: new Date("2026-06-17T10:00:00Z"),
        end: new Date("2026-06-17T11:00:00Z"),
        location: "Your App",
        attendees: ["system@corsair.dev"]
      }
    ];
  }

  return <CalendarClient initialEvents={mappedEvents} session={session} />;
}
