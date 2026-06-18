import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { Groq } from "groq-sdk";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subject, snippet } = await req.json();

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "No Groq API Key found" }, { status: 500 });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    
    const systemPrompt = `You are an event extraction agent. The current date/time is ${new Date().toISOString()}.
Read the provided email subject and snippet and extract the most likely meeting or event details.
Return a JSON object with the following keys:
- "title": A short summary (e.g. "Dinner with Ashish"). Use subject if not sure.
- "date": MUST be strictly in YYYY-MM-DD format based on today's date (e.g. if today is 2026-06-18 and it says "tomorrow", output "2026-06-19"). Do not output words like "Tomorrow". If no date is found, leave as empty string.
- "time": MUST be strictly in HH:MM (24-hour format). If no time is found, leave as an empty string "".
- "attendees": Comma-separated list of emails if present, otherwise empty string.

Respond ONLY with valid JSON.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: JSON.stringify({ subject, snippet }) }
      ],
      response_format: { type: "json_object" }
    });

    const reply = completion.choices[0]?.message?.content;
    if (reply) {
      const parsed = JSON.parse(reply);
      return NextResponse.json({
        success: true,
        title: parsed.title || subject,
        date: parsed.date || "",
        time: parsed.time || "",
        attendees: parsed.attendees || ""
      });
    }

    throw new Error("Failed to parse AI output");
  } catch (error: any) {
    console.error("Parse event error:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}
