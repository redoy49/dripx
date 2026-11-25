# DripX

> Enterprise-grade, multi-channel cold outreach automation platform. Build visual sequences across Email and LinkedIn, reply with 0ms optimistic UI from a unified inbox, and let the cloud background worker handle follow-ups on autopilot.

[![Next.js](https://img.shields.io/badge/Next.js-16.2.4-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-blue?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Live Production:** [https://www.gurluxe.store](https://www.gurluxe.store)  
*(Also accessible via: [https://dripx-kappa.vercel.app](https://dripx-kappa.vercel.app))*

---

## ⚡ Next.js 16.4 & React 19 Performance Architecture

DripX is built from the ground up on Next.js 16 and React 19, incorporating the instant-navigation design patterns pioneered by Vercel v0:

* **0ms Optimistic UI Mutations:** Powered by React 19 `useOptimistic` and Next.js Server Actions (`app/actions/`). Sending inbox replies or toggling campaign statuses updates the UI in **0ms** without waiting for network round-trips.
* **Server Component Streaming:** Route pages (`/dashboard`, `/dashboard/campaigns`, `/dashboard/inbox`) render as lightweight Server Component Shells with `<Suspense>`. The static layout renders in <20ms while database data streams over HTTP chunked transfer encoding.
* **Sub-50ms Instant Navigation:** Next.js 16 client router cache with `staleTimes` (`dynamic: 30s`, `static: 180s`) paired with `optimisticClientCache: true` and intent-based `<Link prefetch={true}>`.
* **Zero Layout Shift (CLS = 0) Skeleton UI:** Handcrafted, theme-matched shimmer loading states across all 8 dashboard routes (`loading.jsx` + reusable `app/components/ui/Skeleton.jsx`).
* **Bundle Splitting & Lazy Flow Canvas:** Drag-and-drop canvas engine (`@xyflow/react`) is dynamically imported via `next/dynamic` with `ssr: false`, trimming **~350 KB** off the initial bundle.
* **Zero-CLS Typography:** Self-hosted Google Fonts (`Outfit` and `Playfair_Display`) via `next/font/google` eliminate external render-blocking stylesheets.

---

## 🎯 Why DripX?

Tools like Instantly, Lemlist, and Apollo charge heavy recurring fees per seat or mailbox, lock multi-channel workflows behind enterprise tiers, and keep your prospect data hostage on their servers.

DripX gives founders, agencies, and revenue teams total sovereignty over their sales engine:
- **Zero per-mailbox or per-seat fees.** Connect unlimited Google Workspace, Gmail, or custom SMTP accounts.
- **True multi-channel out of the box.** Combine cold emails and LinkedIn touches (connections, direct messages, InMails, profile visits, post likes) in one visual canvas.
- **Native RFC 2822 email threading.** Follow-up emails land in the recipient's existing inbox thread (`Re: original subject`) instead of scattering into new threads.
- **Auto-pause on reply.** When a prospect responds—via email or LinkedIn—their sequence stops immediately to prevent embarrassing automated follow-ups.

---

## 🚀 Core Features

### 1. Drag-and-Drop Sequence Canvas
Build automated outreach workflows on an interactive node canvas:
* **Email & Threaded Follow-up:** Draft initial cold emails and thread replies automatically.
* **LinkedIn Actions:** Send connection requests with custom notes, send direct InMails/messages, visit profiles, or like recent posts.
* **Smart Delays & Conditions:** Set delays in minutes, hours, or days. Add conditional branches (e.g. *Did they reply?*).
* **Pre-Activation Validator:** Detects missing subject lines, empty templates, or broken branches before your campaign ever fires.

### 2. Bulletproof RFC 2822 / 5322 Email Threading
Email clients like Gmail, Outlook, and Apple Mail thread conversations using standard `Message-ID`, `In-Reply-To`, and `References` headers. DripX queries the mail server metadata on delivery, caches the true RFC 2822 `Message-ID`, and links subsequent follow-ups to that exact ID with `Re: [Subject]`.

### 3. Unified Cross-Channel Inbox
Manage every prospect conversation in one single dashboard:
* Aggregates email replies and LinkedIn chats side-by-side.
* **0ms Optimistic Reply:** Type and hit Send—the chat bubble appears instantly with pending status tracking.
* Mark as Read, Star as Important, or Archive with real-time optimistic state updates.
* Automatic message deduplication protects against duplicate webhook/poll ingestion.

### 4. Sending Limits & Ramp-Up Guardrails
* **Daily Mailbox Ramp-Up:** Gradually increase daily volume per mailbox to protect your domain reputation.
* **Working Hours & Timezone Optimization:** Ensure emails and messages land strictly during business hours in your prospect's timezone.
* **Account Safety Caps:** Hard daily limits at both workspace and campaign levels.

### 5. Multi-Model AI Agent Workspace (`/dashboard/agent`)
An embedded hybrid AI Agent + Outreach Copilot accessible from the sidebar:
* **3 Execution Modes:** `Build` (full read, draft, and guarded live actions), `Plan` (read-only strategy & analytics), and `Ask` (copywriting & Q&A without workspace tool calls).
* **Universal BYOK & Live Model Discovery:** Connect River AI, OpenRouter, Vercel AI Gateway, Groq, Anthropic, OpenAI, DeepSeek, Google Gemini, or Custom OpenAI/Anthropic-compatible endpoints in **Settings → AI Providers** (AES-256-GCM encrypted). DripX queries `/models` live and organizes unlocked models in a collapsible provider dropdown.
* **Safe Drafts & Human-in-the-Loop Guardrails:** Builds draft campaigns, React Flow sequences, and lead enrollments automatically, while requiring explicit **Confirm & Execute** approval before activating campaigns, sending live inbox replies, or deleting campaigns.
* **Session History & RBAC:** Persistent MongoDB chat sessions with inline rename/delete, `@` workspace context mentions, `/` quick commands, `.csv`/`.txt`/`.md`/`.json` snippet attachments, voice dictation, and per-member `AI Agent` access control under **Teams**.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 16.2.4 (Turbopack, App Router, Server Actions) |
| **Frontend** | React 19.2.4 (`useOptimistic`, `useTransition`, `use`), Tailwind CSS 4, Lucide Icons |
| **Visual Flow Engine** | `@xyflow/react` (React Flow) dynamically code-split |
| **AI Agent Runtime** | Vercel AI SDK (`ai` v6, `@ai-sdk/react`, `ToolLoopAgent`) with Multi-Provider BYOK |
| **Database** | MongoDB Atlas (official Node.js MongoDB driver v7) |
| **Authentication** | JWT Sessions + Google OAuth 2.0 |
| **Email Transport** | Google Workspace / Gmail API (OAuth 2.0), SMTP, Resend, Mock |
| **LinkedIn Gateway** | Unipile Cloud API Connector |
| **Deployment** | Vercel (Hobby Tier) + `cron-job.org` (24/7 background queue runner) |

---

## 📂 Project Structure

```text
dripx/
├── app/
│   ├── (auth)/                # Clean centered login & register pages
│   ├── (dashboard)/           # Protected dashboard layout & navigation
│   │   ├── dashboard/
│   │   │   ├── page.jsx       # Server Component Shell (Overview)
│   │   │   ├── DashboardClient.jsx # Interactive dashboard client leaf
│   │   │   ├── campaigns/     # Campaign management & performance
│   │   │   │   ├── page.jsx   # Server Component Shell (Campaigns)
│   │   │   │   ├── CampaignsClient.jsx # Optimistic status switches
│   │   │   │   └── [id]/      # Campaign Command Center & live queue
│   │   │   ├── inbox/         # Unified cross-channel inbox
│   │   │   │   ├── page.jsx   # Server Component Shell (Inbox)
│   │   │   │   ├── InboxClient.jsx # Fast conversation switching
│   │   │   │   └── ConversationThread.jsx # 0ms optimistic message sending
│   │   │   ├── leads/         # Lead lists, tags & CSV imports
│   │   │   ├── new-campaign/  # Sequence builder & dynamic React Flow
│   │   │   ├── settings/      # Sending limits, ramp-up, schedules & AI Providers
│   │   │   ├── teams/         # Team members, roles & AI Agent permissions
│   │   │   └── agent/         # Multi-Model AI Agent workspace & session history
│   ├── actions/               # Next.js Server Actions
│   │   ├── campaignActions.js # Optimistic campaign pause/play & deletion
│   │   └── inboxActions.js    # Outbound email/LinkedIn reply dispatch
│   ├── api/                   # REST API route handlers (campaigns, inbox, agent, cron)
│   ├── components/            # Reusable UI primitives
│   │   └── ui/Skeleton.jsx    # Zero-CLS shimmer loading primitives
│   └── lib/                   # Core engines (jobProcessor, sequenceEngine, email, ai/)
├── instrumentation.js         # Next.js startup hook for local scheduler
├── next.config.mjs            # Next 16 router caching & staleTimes config
└── PROJECT_CONTEXT.md         # Architecture overview & developer notes
```

---

## 🚀 Getting Started

### Prerequisites
* Node.js 18.18+ (Node 20+ recommended)
* A MongoDB connection string (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
* Google Cloud Console OAuth 2.0 Client credentials (for Google login & Gmail sending)

### 1. Clone & Install

```bash
git clone https://github.com/redoy49/dripx.git
cd dripx
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# Database
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/dripx?retryWrites=true&w=majority
DB_NAME=dripx

# Authentication & Security
JWT_SECRET=your_super_secret_jwt_key
CRON_SECRET=your_random_cron_secret_string

# App Base URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Google OAuth (Sign-in & Gmail sending)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# LinkedIn Integration (Unipile - Optional for Email-only setups)
LINKEDIN_PROVIDER=unipile
UNIPILE_DSN=https://apiX.unipile.com:13421
UNIPILE_API_KEY=your_unipile_api_key
```

### 3. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> In local development, DripX runs an internal 30-second scheduler runner automatically via `instrumentation.js`, so jobs process without any external cron setup.

---

## 🌐 Production Deployment (Vercel + 24/7 Automation)

DripX is fully optimized for zero-cost deployment on Vercel's free Hobby tier:

### Step 1: Deploy to Vercel
1. Import your GitHub repository into [Vercel](https://vercel.com/).
2. Copy your `.env.local` variables into **Project Settings > Environment Variables**.
3. Set `NEXT_PUBLIC_APP_URL` to your production domain (e.g. `https://www.gurluxe.store`).
4. Click **Deploy**.

### Step 2: Google OAuth Configuration
In [Google Cloud Console](https://console.cloud.google.com/apis/credentials), add your production URLs to your OAuth 2.0 Client ID:

* **Authorized JavaScript Origins:**
  * `https://your-domain.com`
  * `https://www.your-domain.com`
* **Authorized Redirect URIs:**
  * `https://www.your-domain.com/api/auth/google/callback`
  * `https://www.your-domain.com/api/email-accounts/google/callback`

### Step 3: 24/7 Automated Background Runner
Because Vercel functions are serverless, keep the background queue ticking 24/7 for free using [cron-job.org](https://cron-job.org):
1. Create a free account on `cron-job.org`.
2. Add a new cron job pointing to:
   ```text
   https://www.your-domain.com/api/cron/run-scheduler?secret=YOUR_CRON_SECRET
   ```
3. Set schedule to **Every 1 minute**.

That's it. Your cold email and LinkedIn sequences will run around the clock without keeping your computer on.

---

## 🧪 Verification & Quality Control

Ensure zero regressions before opening PRs:

```bash
# Run AI Agent unit tests
node --test app/lib/ai/agent_foundation.test.mjs

# Run ESLint (enforcing 0 errors and 0 warnings)
npm run lint

# Validate full production build
npm run build
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
