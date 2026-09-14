# DripX — Project Status

Living status doc for picking this project back up in a future session. Update this
file whenever a major chunk of work lands, rather than relying on chat history.

Last updated: 2026-09-14 (uncommitted — see `git status`, nothing below has been
committed yet).

## What DripX is

A Dripify/Expandi-style LinkedIn (+ email) outreach automation tool: campaigns with
multi-step sequences (connection request → wait → message → branch on reply → ...),
lead management, a unified inbox, team management. Next.js 16 (App Router, Turbopack) +
MongoDB + Tailwind v4.

## Recently completed

### 1. Visual workflow builder (drag-and-drop campaign sequence canvas)
Replaced the old linear step-list editor with a React Flow canvas matching Dripify's
node-based builder — draggable action cards, dashed connectors with delay pills,
condition forks (green "Replied" / red "Not replied"), a sidebar of actions/conditions,
"+Add / ○ End" tips at every open path.

- `app/(dashboard)/dashboard/new-campaign/SequenceBuilder.jsx` — the canvas component
- `app/(dashboard)/dashboard/new-campaign/flow/` — `graph.js` (pure step-array ↔
  node/edge graph logic), `FlowNodes.jsx`, `FlowEdge.jsx`, `ActionPicker.jsx`,
  `StepEditorModal.jsx`, `DelayEditorModal.jsx`
- Package added: `@xyflow/react` (React Flow v12)

**Backend correctness fix that came out of this work** (`app/lib/sequenceEngine.js`,
`app/lib/jobProcessor.js`, `app/api/campaigns/[id]/steps/route.js`):
- Added `BRANCH_END` sentinel — an explicit "this branch stops here" marker, distinct
  from `null` (which means "fall through to whatever's positionally next"). Needed so
  building one branch of a condition, then going back to build the other, can't
  silently merge the two paths.
- Added an explicit `next` field on every step (not just `branches` on condition
  steps) — same idea, generalized, so step order in the array never matters for
  correctness once the canvas has touched a step.
- **Found and fixed a real pre-existing bug**: `jobProcessor.js` called
  `resolveNextExecutableStep` with the just-executed action step itself, which made it
  immediately re-select that same step forever instead of advancing. Fixed via a new
  `resolveStepAfter` export that properly advances past the step first.
- `sequence_steps` docs now also store `position: {x, y}` (canvas node position,
  cosmetic only, never read by the execution engine).

### 2. Real LinkedIn automation via Unipile
The app previously only had `MockLinkedInConnector` (100% simulated, no real LinkedIn
account ever touched). Built the real integration:

- `app/lib/integrations/unipile.js` — low-level Unipile API client (hosted-auth link,
  invitations, messaging, profile lookup, webhook management). Needs `UNIPILE_DSN` +
  `UNIPILE_API_KEY` env vars (placeholders already in `.env.local`, not yet filled in).
- `app/lib/connectors/UnipileConnector.js` — real `LinkedInConnector` implementation.
  Implements: `sendConnectionRequest`, `sendMessage`, `sendInMail`, `visitProfile`.
  **Not implemented** (fails clearly, doesn't fake success): `likeRecentPost`,
  `followProfile`, `fetchProfiles` (LinkedIn search import — use CSV/paste-URL import
  instead, those don't depend on this at all).
- `app/lib/connectors/index.js` — factory now supports `LINKEDIN_PROVIDER=unipile`
  (currently still `mock` in `.env.local` — flip once tested).
- Connect flow: `app/api/integrations/unipile/connect/route.js` (starts Unipile's
  hosted-auth wizard — handles LinkedIn login/2FA entirely on Unipile's side),
  `app/api/integrations/unipile/route.js` (GET status / DELETE disconnect).
- 3 webhook receivers under `app/api/webhooks/unipile/`: `account-status` (connect
  result + ongoing health), `messaging` (incoming replies → feeds the unified inbox +
  the "Has Replied?" condition), `users` (connection-accepted, not real-time — Unipile
  says up to ~8h delay on this one).
- Settings → Integrations now has a "LinkedIn (via Unipile)" card
  (`IntegrationsTab.jsx`).
- New `integrations` collection doc shape: `{workspaceId, type:"unipile", status,
  accountId, pendingToken, lastError, connectedAt}`.
- Leads gained a `unipile: {providerId, chatId, connectedAt}` sub-object, resolved/
  cached lazily by the connector.
- New outbound webhook event: `connection.accepted` (added to `WEBHOOK_EVENTS` in
  `app/api/webhooks/route.js`).

### 3. Fixes found while testing the Unipile connect flow live
- `next.config.mjs`: added `allowedDevOrigins` (ngrok wildcard) — Next's dev server
  blocks cross-origin requests by default, which was silently breaking register/login
  and API calls when accessed through the ngrok tunnel.
- `app/lib/sequenceEngine.js` bug fix (see above) — surfaced by this same testing pass.
- **CSV import bug**: `app/lib/csv.js` didn't strip a leading UTF-8 BOM, which Excel adds
  to CSVs exported on Windows. Left in place, it silently attaches to the first header
  cell, so that column never matches a known field and its data gets dropped from every
  row — this was why an uploaded CSV appeared to import nothing. Fixed; verified with a
  BOM'd sample file.
- `app/(dashboard)/dashboard/new-campaign/LeadSourceModal.jsx` now shows a real error
  when an import parses to 0 leads, instead of silently closing the modal.
- Added lead enrichment: `app/lib/connectors/UnipileConnector.js` exports
  `previewLinkedInProfile()`, called from `app/api/leads/import/route.js` — when
  `LINKEDIN_PROVIDER=unipile` and a lead only has a LinkedIn URL, its name/headline are
  now fetched via Unipile at import time (capped at 20 rows per import to avoid
  hammering the API on a large CSV). Best-effort — never blocks the import on failure.

## What's NOT done yet

**Required before this actually goes live:**
1. User needs to: install/run a tunnel (ngrok, chosen for local testing), get real
   `UNIPILE_DSN` + `UNIPILE_API_KEY` from their Unipile dashboard, fill `.env.local`,
   browse the app through the tunnel's HTTPS URL (not localhost — the connect flow and
   webhooks derive their base URL from the request, so localhost can't be reached by
   Unipile), click Connect LinkedIn in Settings, test a real connection request end to
   end, then flip `LINKEDIN_PROVIDER` to `unipile`.
2. Production deploy — still local/ngrok only. Needs Vercel (or similar) + production
   env vars + **Vercel Cron pointed at `/api/cron/run-scheduler`** (the code and exact
   `vercel.json` cron config are already documented as a comment in that route file —
   nothing currently triggers the scheduler automatically).
3. Confirm the `MONGO_URI` already in `.env.local` is a real production-grade Atlas
   cluster (it looks like one, but wasn't explicitly confirmed as "the production db").

**Not implemented (known gaps, not blocking a basic campaign):**
- Like Post / Follow LinkedIn actions
- LinkedIn search-based lead import (Sales Navigator, etc.) — CSV upload and "paste
  profile URLs" work fine as the real, working alternative
- Payment/billing (Stripe etc.) — nothing built if this becomes a paid SaaS
- Terms of Service / Privacy Policy — worth having given LinkedIn automation ToS risk
- Error monitoring (Sentry or similar) — nothing set up

## Key decisions made (context for "why", not just "what")

- **Chose Unipile over building in-house LinkedIn automation.** Discussed the full
  cost/effort tradeoff (proxies, browser farm, anti-detection, a companion Chrome
  extension for session-cookie capture, perpetual arms race with LinkedIn's detection).
  Unipile pricing: tiered per-connected-account/month, starts at $55/mo for up to 10
  accounts, drops to $3.50–5.50/account at scale. Revisit building in-house only once
  volume is high enough that the per-account fee would exceed a dedicated engineer's
  ongoing maintenance cost.
- **Webhook auth**: a shared secret derived deterministically from `JWT_SECRET`
  (`unipileWebhookSecret()` in `unipile.js`) is set as a custom header on Unipile's
  persistent `/webhooks` subscriptions. The hosted-auth `notify_url` callback is a
  *different* mechanism that doesn't carry that header, so it's verified instead via a
  one-time token round-tripped through the `name` field (`pendingToken` on the
  `integrations` doc).
- **Self-healing webhook registration**: `ensureWebhooksRegistered()` deletes +
  recreates any webhook whose `request_url` has drifted (e.g. a local ngrok tunnel
  getting a new URL on every restart), since Unipile has no "update webhook" endpoint.
- **Leads/campaign schema deliberately untouched for execution semantics** — `position`
  and `next` are additive fields; the whole workflow-builder rewrite and the Unipile
  integration are backward-compatible with any campaign saved before this work.
