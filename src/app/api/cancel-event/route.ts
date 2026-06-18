import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { events } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getValidAccessToken } from "@/lib/googleAuth";

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId, sendCancellationEmail } = await req.json();

    if (!eventId) {
      return NextResponse.json({ error: "Missing eventId" }, { status: 400 });
    }

    const eventRecord = await db.query.events.findFirst({
      where: and(eq(events.id, eventId), eq(events.userId, session.user.id))
    });

    if (!eventRecord) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const token = await getValidAccessToken(session.user.id);

    if (token && eventRecord.corsairId) {
      const sendUpdates = sendCancellationEmail ? "all" : "none";
      
      const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventRecord.corsairId}?sendUpdates=${sendUpdates}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        console.warn("Google Calendar deletion failed or event didn't exist natively. Proceeding to delete local DB record.");
      }
    }

    // Delete from local DB
    await db.delete(events).where(and(eq(events.id, eventId), eq(events.userId, session.user.id)));

    return NextResponse.json({ success: true, message: "Event cancelled successfully." });
  } catch (error) {
    console.error("Failed to cancel event:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
