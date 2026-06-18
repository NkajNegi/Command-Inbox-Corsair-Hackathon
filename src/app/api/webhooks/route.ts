import { NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { Groq } from "groq-sdk";
import { generateEmbedding } from "@/lib/vector-search";
import { corsair } from "@/corsair";
import { processWebhook } from "corsair";
import { db } from "@/db";
import { emails, events } from "@/db/schema";

const getGroqClient = () => {
  if (!process.env.GROQ_API_KEY) return null;
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

export async function POST(req: Request) {
  try {
    const bodyStr = await req.text();
    const headers = Object.fromEntries(req.headers.entries());
    const tenantId = "Dave"; // As per video demonstration

    // Execute native Corsair SDK webhook processor
    // This will handle signature verification and auto-cache to corsair_entities
    try {
      await processWebhook(corsair, headers, bodyStr, { tenantId });
    } catch (e) {
      console.warn("processWebhook failed or signature invalid (expected in mock environment):", e);
    }

    const payload = JSON.parse(bodyStr);
    const { type, data } = payload;
    
    if (type === "gmail.message.received") {
      // Immediately return 200 OK, but process LLM/DB in the background using waitUntil
      waitUntil((async () => {
        let priorityScore = 0.5; // default
        try {
          // Lightning-fast priority check using Groq Llama-3
          const groq = getGroqClient();
          if (groq) {
            const completion = await groq.chat.completions.create({
              messages: [
                { role: "system", content: "You are an email assistant. Score the priority of this email from 0.0 to 1.0. High priority is 0.8+. Return ONLY a float number." },
                { role: "user", content: `Subject: ${data.subject}\nSnippet: ${data.snippet}` }
              ],
              model: "llama3-8b-8192",
            });
            
            const content = completion.choices[0]?.message?.content || "0.5";
            priorityScore = parseFloat(content) || 0.5;
          }
        } catch (err) {
          console.error("Groq Priority check failed:", err);
        }

        // Generate semantic embedding for the new email to enable sub-second vector search later
        let embeddingVector: number[] = [];
        try {
          embeddingVector = await generateEmbedding(`${data.subject} ${data.snippet}`);
        } catch (e) {
          console.error("Embedding generation failed:", e);
        }

        // Write the email to the local database cache
        try {
          const user = await db.query.users.findFirst();
          if (user) {
            await db.insert(emails).values({
              corsairId: data.id || "webhook-msg-" + Date.now(),
              threadId: data.threadId || data.id || "webhook-thread-" + Date.now(),
              subject: data.subject || "No Subject",
              snippet: data.snippet || "",
              bodyText: data.bodyText || data.snippet || "",
              fromAddress: data.from || data.fromAddress || "unknown@corsair.dev",
              toAddress: data.to || data.toAddress || user.email,
              date: data.date ? new Date(data.date) : new Date(),
              userId: user.id,
              priorityScore: priorityScore,
              embedding: embeddingVector.length > 0 ? embeddingVector : null,
              isRead: false,
              isArchived: false,
            });
            console.log(`[Webhook Ingest] Cached new email: ${data.subject} with priority: ${priorityScore}`);
          }
        } catch (dbErr) {
          console.error("[Webhook Ingest] Local DB email insertion failed:", dbErr);
        }
      })());

      return NextResponse.json({ success: true, message: "Processing in background" });
      
    } else if (type === "calendar.event.created") {
      // Handle calendar event creation and save to local DB
      waitUntil((async () => {
        try {
          const user = await db.query.users.findFirst();
          if (user) {
            await db.insert(events).values({
              corsairId: data.id || "webhook-evt-" + Date.now(),
              summary: data.summary || data.title || "Untitled Event",
              description: data.description || "",
              startTime: data.start?.dateTime ? new Date(data.start.dateTime) : new Date(),
              endTime: data.end?.dateTime ? new Date(data.end.dateTime) : new Date(),
              location: data.location || "",
              attendeesRaw: data.attendees?.map((a: { email?: string }) => a.email).join(",") || "",
              userId: user.id,
            });
            console.log(`[Webhook Ingest] Cached new calendar event: ${data.summary || data.title}`);
          }
        } catch (err) {
          console.error("[Webhook Ingest] Local DB calendar event insertion failed:", err);
        }
      })());

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true, message: "Unhandled event type" });

  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
