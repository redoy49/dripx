# DripX - Project Context & Architecture Status

**Last Updated:** November 24, 2026  
**Active Git Branch:** `main` (Fully up to date with `origin/main`)  
**Live Production URL:** `https://www.gurluxe.store` *(also accessible via `https://dripx-kappa.vercel.app`)*

---

## 1. Project Overview & Tech Stack
DripX is a modern, self-hosted, cloud-native **Cold Outreach Automation Platform** (alternative to Instantly, Lemlist, Apollo, and Dripify).

* **Framework:** Next.js 16.2.4 (Turbopack, App Router, Server Actions)
* **Frontend:** React 19.2.4 (`useOptimistic`, `useTransition`, `use`), Tailwind CSS 4, Lucide icons, Framer Motion
* **Database:** MongoDB Atlas (`MONGO_URI` configured in `.env.local` & Vercel)
* **Authentication:** NextAuth / JWT (`JWT_SECRET`) + Google OAuth 2.0 (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`)
* **Email Protocols:** Google Workspace / Gmail API (OAuth 2.0), SMTP, Resend, Mock connector
* **LinkedIn Integration:** Unipile cloud API connector (`UNIPILE_DSN`, `UNIPILE_API_KEY`)
* **Hosting:** Vercel (Hobby)
* **24/7 Cloud Background Automation:** [cron-job.org](https://cron-job.org) running every 1 minute targeting `/api/cron/run-scheduler?secret=CRON_SECRET`

---

## 2. Core Implemented Features

### A. Multi-Channel Visual Sequence Builder (Canvas Flow)
* **Path:** `app/(dashboard)/dashboard/new-campaign/flow/`
* Interactive drag-and-drop node graph canvas with custom branches, connection lines, auto-layout, zoom/pan, undo/redo.
* Code-split dynamically via `next/dynamic` (`ssr: false`) with custom `FlowCanvasSkeleton`, saving ~350 KB on initial bundle load.
* **Supported Step Types:**
  - `email`: Initial cold email outreach.
  - `email_followup`: Threaded follow-up reply (subject input automatically hidden; threads into existing conversation).
  - `delay`: Staggered wait periods (minutes, hours, days).
  - `condition`: Branching rules (e.g. `Has Replied?`).
  - `connection_request`, `message`, `inmail`, `profile_visit`, `like_post`: LinkedIn actions.
* **Validation:** Real-time pre-activation sequence validator (`validation.js`).

### B. Reliable Email Threading (RFC 2822 / RFC 5322 Standard)
* **Issue Solved:** Follow-up emails previously appeared as new separate threads on receiver email clients.
* **Fix Applied:** 
  - `GmailConnector.sendEmail` retrieves real RFC 2822 `Message-ID` header directly from Gmail metadata upon sending.
  - `jobProcessor.js` passes the real parent `Message-ID` in `In-Reply-To` and `References` headers with `Re: [Subject]`.
  - Receiver email clients (Gmail, Outlook, Apple Mail) now group follow-up emails seamlessly into a single thread.

### C. Unified Multi-Channel Inbox
* **Path:** `app/(dashboard)/dashboard/inbox`
* Aggregates inbound and outbound messages across Email and LinkedIn in one view.
* **0ms Optimistic Reply UI:** Powered by React 19 `useOptimistic` in `ConversationThread.jsx`. Typing and sending renders the message bubble instantly with subtle pending status tracking.
* Automatic message deduplication via sparse unique index on `messages.providerMessageId`.
* Direct reply capabilities preserving thread continuity.

### D. Autonomous Sequence Engine & Safeguards
* **Auto-Pause on Reply:** When a lead replies (`handleLeadReplied`), their campaign enrollment status immediately becomes `replied`, cancelling pending follow-ups to prevent awkward automated messages.
* **Ramp-Up & Sending Schedules:** Enforces daily limits, working hours, and sender mailbox ramp-up limits (`rampUpEngine.js`, `scheduleEngine.js`).
* **Persistent Queue:** MongoDB `jobs` collection with `runAfter` timestamps and worker locks (`auto_worker`).

### E. Next.js 16.4 & React 19 Performance Architecture
* **Server Component Streaming Shells:** Overview (`/dashboard`), Campaigns (`/campaigns`), and Inbox (`/inbox`) decomposed into Server Component Shells with `<Suspense>` boundaries.
* **Zero Layout Shift (CLS = 0) Skeleton UI:** Pixel-perfect shimmer skeletons across all 8 dashboard routes (`loading.jsx` + `app/components/ui/Skeleton.jsx`).
* **Next 16 Router Caching:** Configured with `staleTimes` (`dynamic: 30s`, `static: 180s`) and `optimisticClientCache: true` for sub-50ms instant route switching.
* **Zero-CLS Typography:** Self-hosted Google Fonts (`Outfit` and `Playfair_Display`) via `next/font/google`.

---

## 3. Production & Domain Configuration

* **Domains:**
  - `https://www.gurluxe.store` (Primary Custom Domain)
  - `https://dripx-kappa.vercel.app` (Vercel Domain)
* **Google Cloud Console OAuth 2.0 Client:**
  - **Authorized JavaScript Origins:**
    - `https://www.gurluxe.store`
    - `https://gurluxe.store`
    - `https://dripx-kappa.vercel.app`
    - `http://localhost:3000`
  - **Authorized Redirect URIs:**
    - `https://www.gurluxe.store/api/auth/google/callback`
    - `https://www.gurluxe.store/api/email-accounts/google/callback`
    - `https://gurluxe.store/api/auth/google/callback`
    - `https://gurluxe.store/api/email-accounts/google/callback`
    - `https://dripx-kappa.vercel.app/api/auth/google/callback`
    - `https://dripx-kappa.vercel.app/api/email-accounts/google/callback`
    - `http://localhost:3000/api/auth/google/callback`
    - `http://localhost:3000/api/email-accounts/google/callback`
* **Cron-job.org:**
  - Configured with `DripX Campaign Runner` targeting `https://www.gurluxe.store/api/cron/run-scheduler?secret=7a531b3370ab2cbac78ccbce4f41e0ef63b75683acb0636f` running every 1 minute (`200 OK`).

---

## 4. Key Files Reference
* `app/lib/jobProcessor.js`: Queue runner, step dispatching, threading headers, sending limits.
* `app/lib/sequenceEngine.js`: Graph execution walk, step resolvers (`resolveStepAfter`, `resolveFirstExecutableStep`).
* `app/lib/email/GmailConnector.js`: Gmail API client with metadata retrieval.
* `app/lib/email/emailSyncEngine.js`: Inbound email ingestion and sequence pause triggers.
* `app/lib/leadReplied.js`: Cancels queued sequence jobs when prospects respond.
* `app/actions/campaignActions.js`: Next.js Server Actions for campaign pause/resume and deletion.
* `app/actions/inboxActions.js`: Next.js Server Actions for outbound reply sending and status updates.
* `app/api/cron/run-scheduler/route.js`: Cloud endpoint invoked by cron-job.org.
* `app/(dashboard)/dashboard/new-campaign/flow/`: Visual sequence builder components.

---

## 5. Future Roadmap & High-Impact Improvements (Outcompeting Instantly & Lemlist)

These strategic features are queued for implementation to establish DripX as an undisputed market leader:

### 🏆 Priority 1: Multi-Account Inbox Rotation (Round-Robin Sending)
* **Goal:** Assign multiple sender mailboxes (e.g. 5–15 accounts across different domains) to a single campaign.
* **Mechanism:** 
  - Sequential round-robin or quota-weighted dispatching across connected accounts.
  - Keeps individual mailbox volume strictly under safe daily caps (e.g. 30–40 emails/day), allowing campaigns to scale to 500–1,000+ emails/day without triggering spam filters or domain burn.

### 🏆 Priority 2: Automated Peer-to-Peer Email Warmup Engine
* **Goal:** Built-in domain reputation booster without paying for external warmup services.
* **Mechanism:**
  - Background worker exchanges positive conversations between active DripX mailboxes on the network.
  - Automatically flags warmup messages as important, removes them from spam folders, and marks them as read to build stellar Google Postmaster & Outlook reputation scores.

### 🏆 Priority 3: Spintax & Dynamic Fallback Engine
* **Goal:** Guarantee high inbox placement by eliminating uniform message fingerprinting.
* **Mechanism:**
  - Nested Spintax support inside sequence steps: `{Hi|Hello|Hey} {{first_name | there}}, I {noticed|came across} your work at {{company | your team}}...`
  - Fallback syntax for empty lead properties to prevent awkward blanks.

### 🏆 Priority 4: Pre-Flight Real-Time Email Verification (Zero-Bounce Engine)
* **Goal:** Keep bounce rates strictly below 2% to protect sender deliverability.
* **Mechanism:**
  - 1-second pre-flight MX record check and non-intrusive SMTP handshake ping prior to queue dispatch.
  - Automatically flags or skips invalid, dead, or disposable email addresses before sending.

### 🏆 Priority 5: Real-Time SSE (Server-Sent Events) for Unified Inbox
* **Goal:** Replace 10-second polling with true real-time instant messaging.
* **Mechanism:**
  - Lightweight SSE endpoint (`/api/inbox/stream`) pushing new inbound emails and LinkedIn chat messages immediately to the open thread without browser refresh.

### 🏆 Priority 6: Client-Side Web Worker CSV Parser
* **Goal:** Zero browser lag when importing massive lead lists (50,000+ contacts).
* **Mechanism:**
  - Dedicated background Web Worker executing PapaParse. Prevents freezing the UI thread, providing instant progress bar feedback and client-side deduplication.

### 🏆 Priority 7: DOM Virtualized Lead Table (`@tanstack/react-virtual`)
* **Goal:** Lightning-fast rendering for 100,000+ lead pools.
* **Mechanism:**
  - Renders only visible rows in the viewport while recycling DOM nodes, maintaining smooth 60 FPS scrolling and low memory footprint.

### 🏆 Priority 8: AI Icebreaker & Lead Sentiment Classifier
* **Goal:** Automated hyper-personalized first lines and automated lead triage.
* **Mechanism:**
  - LLM integration (Gemini / Claude) generating custom first-line hooks based on prospect's company news or LinkedIn profile.
  - AI Sentiment Classifier tagging inbound replies:
    - 🟢 *Interested / Meeting Booked* → Auto-syncs to CRM.
    - 🟡 *Out of Office* → Auto-pauses sequence until prospect returns.
    - 🔴 *Not Interested* → Auto-unsubscribes lead.

### 🏆 Priority 9: 1-Click CAN-SPAM / GDPR Unsubscribe Engine
* **Goal:** International legal compliance and instant suppression management.
* **Mechanism:**
  - Automatic `{{unsubscribe_url}}` injection with 1-click opt-out landing page.
  - Immediately places prospect onto a workspace-wide global suppression list across all campaigns.

### 🏆 Priority 10: Global Command Palette (`Cmd + K` / `Ctrl + K`)
* **Goal:** Supercharged agency workflow navigation.
* **Mechanism:**
  - Fast fuzzy search over campaigns, active leads, open conversation threads, and quick actions via `cmdk`.

### 🏆 Priority 11: Mailbox Health Scoreboard & Deliverability Observability
* **Goal:** Proactive prevention of delivery disasters.
* **Mechanism:**
  - Visual scoreboard auditing SPF, DKIM, DMARC alignment, MX records, and blacklist status for every connected sender account with auto-remediation tips.
