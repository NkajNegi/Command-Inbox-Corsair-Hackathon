# Command Inbox: Cybernetic Workflow Edition ⚡

## Overview
When you use Gmail or Google Calendar, a regular workflow usually takes a few more clicks than it should. Sending a calendar invite or managing your daily triage often involves tedious UI steps that slow down power users. 

**Command Inbox** is a Superhuman-style email and calendar management application built entirely to fix this. It leverages native Google APIs to completely bypass the traditional Gmail/Calendar interfaces, giving you a lightning-fast, keyboard-driven, and highly intuitive workspace designed exactly how a power user needs it.

Built for the **MacBook Giveaway Hackathon**, this project empowers users to search, draft, send, receive emails, and schedule events seamlessly without the lag of traditional clients.

## 🛠 Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL (Neon) with `pgvector` for local embedding searches
- **ORM**: Drizzle ORM
- **Authentication**: NextAuth.js (Google Provider)
- **Styling**: TailwindCSS & Framer Motion
- **AI Models**: Groq API (Llama-3-70b / Mixtral-8x7b)

## 🚀 Features & Workflow Improvements

### 1. Lightning-Fast Local Search (Bonus Completed)
We added a vector database (`pgvector`) to the existing Postgres database. Emails are cached and embedded locally, allowing you to perform semantic, lightning-fast searches across your entire email history in under 1 second without hitting the Gmail API.

### 2. Autonomous Agent Chat (Bonus Completed)
We integrated a dynamic AI Agent directly into the interface. You can chat with the agent to execute complex workflows automatically:
- *"Check my inbox for messages and add schedules to the schedule log."*
- *"Send a calendar invite to friend@corsair.dev at 9 AM next Thursday. Send him an email too saying I look forward to our meeting."*
The agent natively parses your recent emails, extracts dates/times, and invokes tools to schedule events and send emails on your behalf.

### 3. Automatic AI Priority Filtering (Bonus Completed)
All synced emails are automatically passed through a lightning-fast Groq LLM to determine their priority level based on the subject and body. High-priority emails are instantly highlighted in the UI so you never miss critical messages.

### 4. Keyboard Driven Actions (Bonus Completed)
The entire application is wired with keystrokes (e.g., `Cmd + Enter` to send emails), allowing users to perform common actions instantly without clicking around.

### 5. Intuitive Calendar Grid
The calendar isn't just a vertical list; it includes a dynamic Monthly Grid View that visually slots your Google Calendar events perfectly into a cohesive, highly scannable timeline, while filtering out expired past events.

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
