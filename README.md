# Command Inbox - Corsair Hackathon Submission

A highly optimized, Superhuman-style email and calendar management application built with Next.js, Postgres, and Corsair for the ChaiCode MacBook Giveaway Hackathon.

## Builder Mode On | MacBook Giveaway Hackathon
Built for the ChaiCode community. 
*Tags:* #chaicode #corsair-dev

---

## 🚀 Phased Project Architecture

### Phase 1: Tech Stack (Optimal, Cheapest & Reliable Path)
The foundational layer carefully selected to ensure maximum developer velocity, zero upfront infrastructure costs, and serverless scalability.
- **Frontend & Edge Hosting:** Next.js 14/15 (App Router) deployed on **Vercel**. Provides global edge caching and auto-scaling entirely on the free tier.
- **Database & Vector Storage:** **Neon Serverless Postgres** (or Supabase). Gives us a generous free tier, scale-to-zero compute to save costs, and built-in `pgvector` so we don't need a separate expensive vector database.
- **ORM:** **Drizzle ORM** (or Prisma). Extremely lightweight, ensuring fast cold-start times on serverless functions without the memory overhead.
- **Integration Layer:** **Corsair SDK**. Handles all Google OAuth, token refreshing, and webhooks as a managed service, completely removing the need for us to host and pay for our own Redis queues or polling workers.
- **AI/LLM:** **Groq (Llama-3)** for lightning-fast, nearly free inference on agent chat, or **OpenAI GPT-4o-mini** for highly reliable, rock-bottom-priced text embeddings and priority filtering.

### Phase 2: System Design (Optimal, Cheapest & Reliable Path)
The data flow and backend orchestration are engineered to prevent timeouts and minimize compute duration.
- **Zero-Latency Webhooks (`/api/corsair/webhook`):** Using Next.js 15's `unstable_after()` (or `waitUntil`), we immediately acknowledge Corsair webhooks with a 200 OK. This guarantees Corsair never receives a timeout error and eliminates the need for expensive external queues like Redis or SQS.
- **Asynchronous AI Pipeline:** Once the webhook is acknowledged, the serverless function spins off the Groq priority scoring and pgvector embedding generation strictly in the background. 
- **Local Caching & Edge Fetching:** Next.js Data Cache is utilized to serve the inbox UI instantly. We bypass slow third-party API limits by querying our local vector-synced Postgres DB directly.
- **Agentic Chat (`/api/chat`):** A Corsair MCP endpoint interprets natural language commands from the user and dispatches them directly via Corsair's SDK, acting as a lightweight proxy without needing heavy LangChain setups.

### Phase 3: User Interface (UI) Architecture (Optimal, Cheapest & Reliable Path)
Focusing on the "Superhuman-style" workflows using zero-cost, battle-tested modern tools.
- **React Server Components (RSC):** The core inbox (`EmailList`, `EmailDetail`) is architected as Server Components. This sends exactly 0kb of JavaScript to the client for the main UI, minimizing your bandwidth costs (cheapest) and guaranteeing instant time-to-interactive (optimal).
- **Headless UI Primitives (shadcn style):** We rely on open-source, unstyled Radix-like accessible components. This guarantees 100% reliability for screen readers and keyboard navigation without paying for heavy proprietary UI libraries.
- **Tailwind CSS Utility Engine:** Compiles down to a microscopic CSS file. Reliable across all browsers with absolute zero runtime styling overhead.
- **Dynamic Client Boundaries:** Heavy interactive pieces like the `framer-motion` `CommandPalette` are isolated in `"use client"` boundaries and lazy-loaded via `next/dynamic`. They never block the server's critical rendering path.

### Phase 4: Performance & Optimization (Optimal, Cheapest & Reliable Path)
Ensuring the application feels instantaneous while keeping operational costs at absolute zero.
- **React 19 `useOptimistic` UI:** We simulate instant sends and archives on the frontend immediately. This hides all network latency from the user (optimal performance) and guarantees the UI never locks up (highly reliable UX).
- **Vercel Edge Data Caching:** We heavily utilize Next.js Route Caching and Data Fetch caching. Subsequent page loads require zero database calls, meaning we don't rack up expensive database read operations (cheapest).
- **Native `pgvector` HNSW Indexing:** Rather than paying hundreds of dollars a month for a dedicated managed vector database, we use Postgres-native HNSW indices. This guarantees sub-millisecond semantic search retrieval that scales reliably.

---

## 🎯 Hackathon Deliverables

### Corsair Features Used
- **Gmail Integration:** Core reading/sending workflows via Corsair unified APIs.
- **Google Calendar Integration:** Creating events and fetching schedules.
- **Realtime Webhooks:** Bypassing standard API polling.
- **Corsair Search API:** Integrated into the Advanced Search UI.
- **Corsair MCP:** Integrated for the AI Agent Chat assistant.

### Bonus Tasks Attempted & Completed
- ✅ **Corsair MCP agent chat** - (Ask the agent to schedule meetings for you via natural language)
- ✅ **Realtime webhooks** - (Receive events instantly)
- ✅ **Keyboard shortcuts & Command Palette** - (`Ctrl+K` for commands, `⇧⌘F` for search)
- ✅ **Automatic LLM Priority Filtering** - (Scores incoming webhooks for importance)
- ✅ **Fast Local Vector Search** - (Cached emails in Postgres `pgvector` for instant retrieval)

---

## 🛠 Getting Started

1. Clone the repository.
2. Run `npm install`.
3. Set your environment variables in `.env`:
   ```env
   DATABASE_URL="postgres://user:pass@host/db"
   CORSAIR_API_KEY="your-corsair-key"
   OPENAI_API_KEY="your-openai-key"
   ```
4. Run `npx drizzle-kit push` to initialize your database schema.
5. Run `npm run dev` to start the local development server.
