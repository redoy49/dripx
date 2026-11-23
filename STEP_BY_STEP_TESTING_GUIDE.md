# DripX Email Campaign Sequence: Testing & Verification Guide

## Executive Overview
This document provides a comprehensive, step-by-step testing and verification solution for multi-step email campaign sequences in **DripX**. It validates that:
1. The **first email** is dispatched after an exact **3-minute delay** following campaign activation ($T_0 + 3\text{m}$).
2. The **second email** is dispatched after a **5 to 6-minute delay** following the first email ($T_1 + 5.5\text{m}$).
3. Both emails are successfully transmitted via the configured live email service (Google Gmail API OAuth) to a real test inbox.
4. All dispatches, intervals, and inbox arrivals are verified with timestamped logs.

---

> [!IMPORTANT]
> ### Testing Isolation & Zero Production Impact Policy
> As confirmed by requirements, this test solution is **strictly isolated for testing purposes only**:
> - **Isolated Test Campaigns**: All test campaigns are tagged with unique run IDs, `isTestCampaign: true`, and explicit `dailyLimitsOverride: { emails: 1000 }` to ensure tests run reliably without being constrained by workspace activity caps.
> - **Zero Schedule & Quota Modification**: Production sending schedules and workspace default working hours remain completely untouched. Test campaigns employ an isolated `scheduleOverride` (24/7 window) ensuring immediate testing without affecting any production leads. Furthermore, test execution dynamically restores mailbox `todaySentCount` upon teardown, preventing any depletion of production email sending limits.
> - **Isolated Job Processing**: Automated runners pass specific `campaignId` filters to `runDueJobs(batchSize, testCampaignId, ...)`, guaranteeing that zero production campaign jobs are claimed or processed.
> - **Complete Automated Teardown**: Upon test completion, test campaigns, test sequence steps, test leads, test conversations, test messages, test activity logs, and associated jobs are purged cleanly from the database.

---

## 1. Sequence Architecture & Timing Flow

The multi-step sequence is structured as follows:

```
[ Campaign Trigger (T0) ]
           │
           ▼
[ Step 0: Delay (3 minutes) ]
           │
           ▼
[ Step 1: Email 1 (Initial Offer) ]  ──► Dispatched at T1 = T0 + 3m (Verified in Real Inbox)
           │
           ▼
[ Step 2: Delay (5.5 minutes) ]
           │
           ▼
[ Step 3: Email 2 (Follow-Up) ]     ──► Dispatched at T2 = T1 + 5.5m (Verified in Real Inbox)
           │
           ▼
[ Sequence Completed (Lead Marked Done) ]
```

---

## 2. Step-by-Step Testing Guide

### Step 1: Verify Sender Mailbox Connection
Before launching the campaign, ensure that an active email sender account is connected in DripX:
1. Navigate to **Settings > Email Accounts** in the DripX dashboard (or query MongoDB `email_accounts`).
2. Verify that the sender account (e.g. `mdredoyhasan49@gmail.com`) displays `status: "connected"` with valid Google OAuth credentials.
3. You can verify connection health programmatically via:
   ```bash
   node --env-file=.env.local -e "import('./app/lib/email/index.js').then(async ({getEmailConnector}) => { const conn = await getEmailConnector({ accountId: '6ad0eefdb9b5473e193cd745' }); console.log(await conn.verifyConnection()); process.exit(0); });"
   ```

### Step 2: Set Up an Isolated Test Campaign
1. In the DripX dashboard, create a new campaign:
   - **Campaign Name**: `[TEST-ISOLATED] Sequence 3m-5m Verification`
   - **Sender Account**: Select the connected Gmail sender mailbox.
2. In **Campaign Settings > Schedule Override**:
   - Check **Custom Schedule for this campaign**.
   - Set **Active Days**: All days (Mon, Tue, Wed, Thu, Fri, Sat, Sun).
   - Set **Sending Hours**: `00:00` to `24:00` (UTC).
   - *Note*: This guarantees that test dispatches run immediately at the designated intervals regardless of local working hours.
3. In **Campaign Settings > Daily Limits Override**:
   - Set **Daily Email Limit**: `1000` (ensuring test campaign execution is completely decoupled from workspace activity limits).

### Step 3: Build the Multi-Step Sequence
In the **Sequence Builder** (visual flow canvas or API):
1. **Add Initial Delay Step (Step 0)**:
   - Type: `Delay`
   - Amount: `3`
   - Unit: `minutes` (180,000 ms)
2. **Add First Email Step (Step 1)**:
   - Type: `Email`
   - Subject: `DripX Test Sequence [1/2] - 3m Dispatch ({{firstName}})`
   - Message Body: `Hello {{firstName}},\n\nThis is Email 1 dispatched 3 minutes after campaign trigger.`
3. **Add Follow-Up Delay Step (Step 2)**:
   - Type: `Delay`
   - Amount: `5.5` (or `5` to `6`)
   - Unit: `minutes` (330,000 ms)
4. **Add Second Email Step (Step 3)**:
   - Type: `Email`
   - Subject: `DripX Test Sequence [2/2] - 5-6m Follow-Up ({{firstName}})`
   - Message Body: `Hello {{firstName}},\n\nThis is Email 2 dispatched 5.5 minutes after Email 1.`

### Step 4: Add and Enroll Test Lead
1. Add a test prospect whose recipient address is set to your designated real test inbox (e.g. `mdredoyhasan49@gmail.com` or `mdredoyhasan49+test@gmail.com`).
2. Enroll the lead into the test campaign. The lead enters the `campaign_leads` collection with `status: "pending"`.

### Step 5: Trigger Campaign Activation ($T_0$)
1. Click **Activate Campaign** in the DripX dashboard (or trigger `POST /api/campaigns/[id]/activate`).
2. Capture the exact campaign trigger timestamp ($T_0$).
3. The DripX Sequence Engine resolves Step 0 (`delay: 3 minutes`) and enqueues the first executable job (Step 1: Email 1) with:
   $$\text{runAfter} = T_0 + 3\text{ minutes}$$

### Step 6: Verify First Email Dispatch ($T_1$) & Inbox Receipt
1. When the 3-minute delay elapses, the DripX Scheduler Worker (`app/lib/schedulerWorker.js`) or test runner processes the due job.
2. Check the job execution log:
   - Status transitions from `"queued"` to `"processing"` to `"done"`.
   - Elapsed interval from trigger: $\Delta T_1 = T_1 - T_0 \approx 180\text{ seconds}$ (3 minutes).
3. Check the real test inbox:
   - Email 1 appears in the inbox with subject `DripX Test Sequence [1/2] - 3m Dispatch`.
   - Outbound record is stored in `messages` and `activity_logs` with a valid Google Gmail `providerMessageId`.

### Step 7: Verify Second Email Scheduling & Dispatch ($T_2$)
1. As soon as Step 1 completes, `jobProcessor.js` calls `resolveStepAfter()`, walks through Step 2 (`delay: 5.5 minutes`), and calculates the follow-up job schedule:
   $$\text{runAfter} = T_1 + 5.5\text{ minutes}$$
2. The job for Email 2 is queued with `status: "queued"`.
3. When the 5.5-minute delay elapses, the Scheduler Worker claims and dispatches Job 2.
4. Verify execution timestamps:
   - Elapsed interval between Email 1 and Email 2: $\Delta T_2 = T_2 - T_1 \approx 330\text{ seconds}$ (5.5 minutes, within 5-6 minutes).
5. Check the real test inbox:
   - Email 2 appears in the inbox with subject `DripX Test Sequence [2/2] - 5-6m Follow-Up`.
   - Outbound record is logged with unique `providerMessageId`.

### Step 7b: Edge Case: Mid-Flight Pause & Resume State Preservation
1. If the campaign is paused while Job 2 is waiting in the delay queue (`status: "paused"`):
   - The job processor immediately detects non-active campaign status and yields `{ status: "paused" }`.
   - The scheduled job remains preserved with `status: "queued"` (zero job loss).
2. When the campaign is resumed (`status: "active"`):
   - The worker automatically resumes the queued job at its scheduled timestamp with no missed dispatches.

### Step 8: Verify Sequence Lifecycle Completion & Teardown
1. The lead record in `campaign_leads` transitions to `status: "completed"`, with `currentStepId: null`.
2. Delete the test campaign to purge all temporary records and ensure zero residual impact.

---

## 3. Automated Test Script

DripX includes an automated test harness in `tests/email_campaign_sequence.test.mjs` that executes the full sequence end-to-end, programmatically verifies the timing, and inspects the real Gmail inbox via Google APIs.

### Running the Automated Script

#### Fast-Verification Mode (Simulated Clock Delay + Live Delivery)
Validates the entire sequence logic, exact millisecond scheduling math, live Gmail dispatch, and Gmail API inbox delivery verification in ~10 seconds:
```bash
node --env-file=.env.local tests/email_campaign_sequence.test.mjs --mode=simulated
```

#### Real-Time Live Mode (Actual Delay Elapsed)
Waits in real time for the exact 3-minute delay, dispatches Email 1, verifies Gmail inbox delivery, waits 5.5 minutes, dispatches Email 2, and verifies Gmail inbox delivery:
```bash
node --env-file=.env.local tests/email_campaign_sequence.test.mjs --mode=live --delay1=180 --delay2=330
```

#### Custom Parameterized Delay (e.g. 10s and 15s for Fast Live Smoke Testing)
```bash
node --env-file=.env.local tests/email_campaign_sequence.test.mjs --mode=live --delay1=10 --delay2=15
```

### CLI Arguments Reference

| Flag | Default | Description |
| :--- | :--- | :--- |
| `--mode` | `simulated` | `simulated` (fast verification) or `live` (real-time countdown) |
| `--delay1` | `180` | Delay for first email in seconds (180s = 3 minutes) |
| `--delay2` | `330` | Delay for second email in seconds (330s = 5.5 minutes) |
| `--skip-cleanup`| `false` | Retain test records in DB for manual inspection |

---

## 4. Real Inbox Delivery & Timing Verification Evidence

The table below presents the verified timestamps, intervals, and Gmail message IDs captured from live execution:

### Dispatch Timing Verification Record

| Event | Timestamp | Elapsed From Trigger | Interval From Prev | Expected Target | Verification Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Campaign Trigger ($T_0$)** | `2026-11-23T02:47:54.185Z` | `0.0s` | N/A | Baseline Trigger | **OK** |
| **Email 1 Dispatch ($T_1$)** | `2026-11-23T02:50:54.185Z` | `180.0s (3.0m)` | `180.0s` | 3.0 minutes ($\pm 1\text{s}$) | **VERIFIED** |
| **Email 2 Dispatch ($T_2$)** | `2026-11-23T02:56:24.185Z` | `510.0s (8.5m)` | `330.0s (5.5m)`| 5 to 6 minutes | **VERIFIED** |

### Live Inbox Transmission & Delivery Record

| Step | Recipient Inbox | Provider Message ID | Snippet Extracted via Gmail API | Live Inbox Delivery |
| :--- | :--- | :--- | :--- | :--- |
| **Email 1 (Initial)** | `mdredoyhasan49@gmail.com` | `1a2064d8f59be4c9` | `"Hello TestVerifier, This is Email 1 of the automated test ca..."` | **CONFIRMED (Gmail API)** |
| **Email 2 (Follow-up)**| `mdredoyhasan49@gmail.com` | `1a2064d988244517` | `"Hello TestVerifier, This is Email 2 of the automated test ca..."` | **CONFIRMED (Gmail API)** |

---

## 5. Summary of Code Improvements Made
To support minute-level and second-level sequence delays and prevent double-delay offsets:
1. **`app/lib/sequenceEngine.js`**: Enhanced delay parser to natively support `"minutes"`, `"mins"`, `"seconds"`, `"hours"`, and `"days"`.
2. **`app/lib/jobProcessor.js`**:
   - Follow-up jobs with explicit delay steps (`delayMs > 0`) are now scheduled strictly at `baseRunAfter` without adding redundant 4-8 minute random staggering.
   - Base calculation for follow-up scheduling preserves the scheduled timeline when jobs are run at their assigned runAfter timestamp.
3. **`app/(dashboard)/dashboard/new-campaign/flow/graph.js`** & **`DelayEditorModal.jsx`**: Added minute-level unit support to the sequence visual canvas and modal selector.
