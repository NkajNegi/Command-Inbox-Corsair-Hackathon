# Command Inbox: Cybernetic Workflow Edition ⚡

## 🎯 Exactly What We Are Building
**Command Inbox** is a hyper-fast, keyboard-driven email and calendar management application styled with a sleek, cyberpunk/synthwave "CRT terminal" aesthetic. 

It is designed to feel like a command center for power users. Instead of the standard, bloated Google interfaces, users get a minimalist, high-contrast dashboard where they can triage emails, manage their schedule, and invoke autonomous AI agents to handle tedious tasks.

## 💡 Why We Are Building It
When you use Gmail or Google Calendar natively, a regular workflow usually takes a few more clicks than it should. Managing your daily triage often involves bouncing between different tabs, waiting for UIs to load, and dealing with visual clutter. 

Many startups (like Superhuman) have tried to make email and calendar management seamless, but they force you into *their* specific workflow. We are building Command Inbox using **Corsair** building blocks to bypass these limitations. By directly wiring into Google's APIs, we provide a blazingly fast frontend tailored exactly for speed, ensuring your email and calendar management is never limited by how Google thinks you should work.

## 🗺️ The UI Flow & Experience
1. **Authentication:** The user logs in via Google OAuth (powered by NextAuth).
2. **The Terminal Dashboard:** The user is greeted by a dark, neon-accented interface. 
3. **Inbox Triage:** On the left, emails are listed chronologically. Clicking an email opens it instantly. High-priority emails (determined by AI) are flagged with warning colors. 
4. **Calendar Grid:** On the right, the calendar dynamically displays upcoming events. The user can toggle between a simple timeline and a full monthly grid view. Expired past events are automatically filtered out.
5. **Agent Chat:** At the bottom right, a glowing button summons the **Decrypt AI Agent**. The user can type or use voice dictation to ask the agent to search emails or schedule meetings without ever leaving the dashboard.
6. **Control Panel:** A dedicated settings page allows the user to switch the AI processor on the fly (e.g., from Llama-3 to Mixtral) and configure auto-decryption animations.

---

## ⚡ Core Features (The "Must-Haves")
These are the foundational requirements integrated via native Google REST APIs:
- **Gmail Integration:** 
  - Sync and display the user's latest emails.
  - Read email contents securely.
  - Draft and send new emails directly from the dashboard using the Gmail API tunnel.
- **Google Calendar Integration:**
  - Sync and display the user's upcoming events.
  - Filter out expired events so the UI remains focused on the future.
  - Create and schedule new calendar invites, automatically adding attendees.

## 🎁 Extra Features (The "Bonus Tasks")
We went above and beyond to integrate powerful workflows and AI capabilities:

### 1. Autonomous Agent Chat (Corsair MCP Style)
We integrated a dynamic AI Agent directly into the interface. You can chat with the agent to execute complex workflows automatically:
- *"Check my inbox for messages and add schedules to the schedule log."*
- *"Send a calendar invite to friend@corsair.dev at 9 AM next Thursday. Send him an email too saying I look forward to our meeting."*
The agent natively parses your recent emails, extracts dates/times, and invokes tools to schedule events and send emails on your behalf.

### 2. Lightning-Fast Local Search (Vector Database)
We added a vector database (`pgvector`) to the existing Postgres database. Emails are cached and embedded locally, allowing you to perform semantic, lightning-fast searches across your entire email history in under 1 second without ever waiting on the Gmail API.

### 3. Automatic AI Priority Filtering
All synced emails are automatically passed through a lightning-fast Groq LLM to determine their priority level based on the subject and body. High-priority emails are instantly highlighted in the UI so you never miss critical messages.

### 4. Keyboard Driven Actions
The application is wired with keystrokes (e.g., `Cmd + Enter` to send emails), allowing power users to perform common actions instantly without clicking around.

---

## 🛠 Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL (Neon) with `pgvector` for local embedding searches
- **ORM**: Drizzle ORM
- **Authentication**: NextAuth.js (Google Provider)
- **Styling**: TailwindCSS & Framer Motion
- **AI Models**: Groq API (Llama-3-70b / Mixtral-8x7b)

## 📦 Setup & Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/NkajNegi/Command-Inbox-Corsair-Hackathon.git
   cd Command-Inbox-Corsair-Hackathon
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (`.env`):
   ```env
   DATABASE_URL="postgres://..."
   AUTH_SECRET="..."
   GOOGLE_CLIENT_ID="..."
   GOOGLE_CLIENT_SECRET="..."
   GROQ_API_KEY="..."
   OPENAI_API_KEY="..."
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## 🎥 Submission Details
- **GitHub Repo**: [Link to Repo](https://github.com/NkajNegi/Command-Inbox-Corsair-Hackathon)
- **Live Demo**: [Insert Vercel Link Here]
- **Demo Video**: [Insert Video Link Here]
- **Social Posts**: [LinkedIn] / [X/Twitter]

*Builder Mode On | MacBook Giveaway Hackathon*
*#chaicode #corsair-dev*
