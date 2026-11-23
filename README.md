# DripX

> Self-hosted, multi-channel cold outreach that doesn't cost \$150/month. Build sequences visually across Email and LinkedIn, reply from a single inbox, and let the background worker handle follow-ups on autopilot.

[![Next.js](https://img.shields.io/badge/Next.js-16.2.4-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-blue?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Live Demo:** [https://www.gurluxe.store](https://www.gurluxe.store)  

---

## Why DripX?

Tools like Instantly, Lemlist, and Apollo charge hefty monthly fees per seat or mailbox, lock multi-channel workflows behind enterprise tiers, and hoard your campaign data on their servers. 

DripX is built for developers, agencies, and founders who want full control over their outreach pipeline:
- **Zero per-user or per-mailbox subscriptions.** Connect as many Google or SMTP inboxes as you own.
- **True multi-channel out of the box.** Combine cold emails and LinkedIn touches (connections, messages, profile visits, post likes) in one visual canvas.
- **Native RFC 2822 email threading.** Follow-up emails land in the recipient's existing inbox thread (`Re: original subject`) instead of scattering into awkward new threads.
- **Auto-pause on reply.** When a lead responds—whether by email or LinkedIn—their sequence stops instantly so you never send an accidental automated follow-up to someone who already answered.

---

## Features

### 1. Drag-and-Drop Sequence Canvas
Build automated outreach workflows on an interactive node canvas:
* **Email & Threaded Follow-up:** Draft initial cold emails and thread replies automatically.
* **LinkedIn Actions:** Send connection requests with custom notes, send direct InMails/messages, visit profiles, or like recent posts.
* **Smart Delays & Conditions:** Set delays in minutes, hours, or days. Add conditional branches (e.g. *Did they reply?*).
* **Pre-Activation Validator:** Detects missing subject lines, empty templates, or broken branches before your campaign ever fires.

### 2. Bulletproof Email Threading
Email clients like Gmail, Outlook, and Apple Mail thread conversations using standard `Message-ID`, `In-Reply-To`, and `References` headers. DripX queries the mail server metadata on delivery, caches the true RFC 2822 `Message-ID`, and links subsequent follow-ups to that exact ID.

### 3. Unified Inbox
Manage every lead conversation in one screen:
* Aggregates email replies and LinkedIn chats side-by-side.
* Reply directly from the web interface without logging into multiple Gmail or LinkedIn tabs.
* Automatic message deduplication protects against duplicate webhook/poll ingestion.

### 4. Sending Limits & Ramp-Up Guardrails
* **Daily Mailbox Ramp-Up:** Gradually increase daily volume per mailbox to protect your domain reputation.
* **Working Hours & Timezone Optimization:** Ensure emails and messages land strictly during business hours in your prospect's timezone.
* **Account Safety Caps:** Hard daily limits at both workspace and campaign levels.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Frontend** | React 19, Tailwind CSS, Lucide Icons, Framer Motion |
| **Database** | MongoDB Atlas (via official Node.js MongoDB driver) |
| **Authentication** | JWT Sessions + Google OAuth 2.0 |
| **Email Transport** | Google Workspace / Gmail API, SMTP, Resend, Mock |
| **LinkedIn Gateway** | Unipile Cloud API Connector |
| **Deployment** | Vercel (Frontend & Serverless API) + `cron-job.org` (Background runner) |

---

## Getting Started

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

### 2. Environment Variables

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

## Production Deployment (Vercel + 24/7 Automation)

DripX is optimized for zero-cost deployment on Vercel's free Hobby tier:

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

## Project Structure

```text
dripx/
├── app/
│   ├── (auth)/                # Clean centered login & register pages
│   ├── (dashboard)/           # Protected dashboard layouts
│   │   ├── dashboard/
│   │   │   ├── campaigns/     # Campaign management & performance
│   │   │   ├── inbox/         # Unified email + LinkedIn inbox
│   │   │   ├── leads/         # Lead lists, tags & CSV imports
│   │   │   ├── new-campaign/  # Flow canvas & visual sequence builder
│   │   │   └── settings/      # Sending limits, ramp-up & schedules
│   ├── (public)/              # Landing page, pricing & docs
│   ├── api/                   # REST API routes (campaigns, leads, cron)
│   └── lib/                   # Core engines (jobProcessor, sequenceEngine, email)
├── instrumentation.js         # Next.js startup hook for local scheduler
└── PROJECT_CONTEXT.md         # Architecture overview & developer notes
```

---

## Contributing

Contributions are welcome. Feel free to open an issue or submit a pull request:

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m "feat: add amazing feature"`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

Distributed under the MIT License. See `LICENSE` for more information.
