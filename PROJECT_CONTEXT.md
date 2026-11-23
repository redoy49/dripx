# DripX - Project Context & Architecture Status

**Last Updated:** November 23, 2026  
**Active Git Branch:** `main` (Fully up to date with `origin/main`)  
**Live Production URL:** `https://www.gurluxe.store` (also accessible via `https://dripx-kappa.vercel.app`)

---

## 1. Project Overview & Tech Stack
DripX is a modern, self-hosted, cloud-native **Cold Outreach Automation Platform** (alternative to Instantly, Lemlist, Apollo, and Dripify).

* **Framework:** Next.js 16.2.4 (Turbopack, App Router)
* **Frontend:** React 19.2.4, Tailwind CSS, Lucide icons, Framer Motion
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
* Automatic message deduplication via sparse unique index on `messages.providerMessageId`.
* Direct reply capabilities preserving thread continuity.

### D. Autonomous Sequence Engine & Safeguards
* **Auto-Pause on Reply:** When a lead replies (`handleLeadReplied`), their campaign enrollment status immediately becomes `replied`, cancelling pending follow-ups to prevent awkward automated messages.
* **Ramp-Up & Sending Schedules:** Enforces daily limits, working hours, and sender mailbox ramp-up limits (`rampUpEngine.js`, `scheduleEngine.js`).
* **Persistent Queue:** MongoDB `jobs` collection with `runAfter` timestamps and worker locks (`auto_worker`).

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
* `app/api/cron/run-scheduler/route.js`: Cloud endpoint invoked by cron-job.org.
* `app/(dashboard)/dashboard/new-campaign/flow/`: Visual sequence builder components.

---

## 5. Future Roadmap & High-Impact Improvements (Outcompeting Instantly & Lemlist)

These strategic features are queued for implementation to push DripX ahead of commercial market leaders:

### Priority 1: Multi-Inbox Rotation (Mailbox Shuffling)
* **Goal:** Allow assigning multiple connected email accounts (e.g. 5–10 sender mailboxes) to a single campaign.
* **Mechanism:** Round-robin or quota-weighted dispatching across mailboxes. Keeps per-inbox daily volume low, preventing spam flags and allowing massive scale without burning domains.

### Priority 2: Native AI Personalized Icebreakers (`{{ai_icebreaker}}`)
* **Goal:** Automatic hyper-personalized first lines for each prospect using LLM APIs (Gemini 2.5 / Claude).
* **Mechanism:** Scrapes/analyzes prospect company name, role, and industry to write a custom, organic compliment or observation hook. Drastically boosts open and reply rates.

### Priority 3: A/B Variant Testing in Sequence Steps
* **Goal:** Test multiple subject lines and message bodies within the same sequence step.
* **Mechanism:** Split traffic (e.g., 50% Variant A / 50% Variant B) and display live open/reply rates in analytics to automatically declare a winning variant.

### Priority 4: Real-Time Email Verification (Zero Bounce Engine)
* **Goal:** Eliminate bounce rates that harm domain reputation.
* **Mechanism:** Pre-flight DNS MX record check and lightweight SMTP handshake verification 1 second before dispatch. Automatically flags or skips invalid/dead email addresses.

### Priority 5: Spam Word Analyzer & Live Copy Score
* **Goal:** Prevent emails from landing in the promotions or spam folder.
* **Mechanism:** Real-time copy audit inside `StepEditorModal` highlighting high-risk spam keywords (e.g., "100% FREE", "ACT NOW", excessive capitalization) with deliverability recommendations.

### Priority 6: Extreme Performance & Optimistic UI
* **Goal:** Instantaneous, zero-latency user experience across large databases.
* **Mechanism:** 
  - Compound MongoDB indexes on `jobs` (`{ workspaceId: 1, status: 1, runAfter: 1 }`), `messages`, and `campaign_leads`.
  - Optimistic UI updates for Unified Inbox replies and canvas node manipulations.

