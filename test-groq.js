import { Groq } from "groq-sdk";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

async function run() {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: "Say hello in JSON format { \"msg\": \"hello\" }" }],
      response_format: { type: "json_object" }
    });
    console.log("Success:", completion.choices[0].message.content);
  } catch (e) {
    console.error("Groq Error:", e.message);
  }
}
run();
