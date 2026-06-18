import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { emails } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getValidAccessToken } from "@/lib/googleAuth";
import { executeScheduleEvent } from "@/lib/eventScheduler";
import { Groq } from "groq-sdk";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use automated token rotation to handle 1-hour expiration
    const token = await getValidAccessToken(session.user.id);
    if (!token) {
      console.warn("No valid or refreshable Google access token found for user");
      return NextResponse.json({ success: true, count: 0, unlinked: true });
    }

    // Fetch message IDs (excluding spam, trash, promotions, and social tabs)
    const searchQuery = encodeURIComponent("-label:SPAM -label:TRASH -category:promotions -category:social");
    const listRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=50&q=${searchQuery}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store"
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
    const newEmailsForAiProcessing: { subject: string; snippet: string; from: string }[] = [];

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
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store"
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
        newEmailsForAiProcessing.push({ subject, snippet: details.snippet || "", from });
      } catch (innerError) {
        console.error(`Failed to process message ${msg.id}:`, innerError);
      }
    }

    // --- Automated AI Triage Pipeline ---
    if (newEmailsForAiProcessing.length > 0 && process.env.GROQ_API_KEY) {
      try {
        console.log(`[AI Triage] Scanning ${newEmailsForAiProcessing.length} new emails for events...`);
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        
        const systemPrompt = `You are an automated triage agent. The current date/time is ${new Date().toISOString()}.
Your job is to read the provided recent emails and extract any meetings, dinners, travel plans, or scheduled deliveries.
Return a JSON object with a single key "events" containing an array of objects.
Each object must have:
- "title": A short summary (e.g. "Dinner with Ashish")
- "date": MUST be strictly in YYYY-MM-DD format based on today's date (e.g. if today is 2026-06-18 and it says "tomorrow", output "2026-06-19"). Do not output words like "Tomorrow".
- "time": MUST be strictly in HH:MM (24-hour format). Default to "12:00" if no specific time is mentioned.
- "attendees": Comma-separated list of emails if present, otherwise empty string
- "priority": "high" (business/urgent), "medium" (social/dinner), or "low" (deliveries/FYI)

If no events are found, return { "events": [] }. Respond ONLY with valid JSON.`;

        const completion = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: JSON.stringify(newEmailsForAiProcessing) }
          ],
          response_format: { type: "json_object" }
        });

        const reply = completion.choices[0]?.message?.content;
        if (reply) {
          const parsed = JSON.parse(reply);
          if (parsed.events && Array.isArray(parsed.events)) {
            for (const ev of parsed.events) {
              console.log(`[AI Triage] Automatically scheduling: ${ev.title}`);
              await executeScheduleEvent(
                token, 
                session.user.id, 
                ev.title, 
                ev.date, 
                ev.time, 
                ev.attendees || "", 
                ev.priority || "medium",
                "ai-auto-event-"
              );
            }
          }
        }
      } catch (aiError) {
        console.error("[AI Triage] Failed to auto-schedule events:", aiError);
      }
    }

    return NextResponse.json({ success: true, count: syncedCount });
  } catch (error: unknown) {
    console.error("Error syncing emails:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
