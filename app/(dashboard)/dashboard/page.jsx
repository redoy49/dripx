"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Inline SVG Icons
const LinkedInIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="4" ry="4" />
    <path d="M8 11v5" />
    <path d="M11.5 16v-2.65c0-1.243 1.007-2.25 2.25-2.25 1.243 0 2.25 1.007 2.25 2.25V16" />
    <circle cx="8.118" cy="8.063" r=".25" fill="currentColor" />
  </svg>
);

const BellIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#6b7280"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M13.6 20H10.4" />
    <path d="M17 10v-.032A5 5 0 0 0 7 10v2.504L6.528 12.768A2 2 0 0 0 5 14.178v1C5 16.202 5.83 17.032 6.854 17.032h10.292C18.17 17.032 19 16.202 19 15.178v-1a2 2 0 0 0-1.528-1.41L17 12.504V10Z" />
  </svg>
);

const TrashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#9ca3af"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 7h14M18 7v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7M15 3.75H9M10 11v5M14 11v5" />
  </svg>
);

const TeamIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 19c0-2.2 1.8-4 4-4h4c2.2 0 4 1.8 4 4" />
    <path d="M10.5 6A3 3 0 1 1 5.5 10.9" />
    <path d="M16 14h3c1.7 0 3 1.3 3 3" />
    <path d="M19.3 6.7a2.6 2.6 0 1 1-3.5 3.5" />
  </svg>
);

const InfoIcon = ({ size = 14 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="#9ca3af"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M11 15.5h2.3M12.16 15.5V11.25H11M12.1 8.246a.25.25 0 1 0 0 .5.25.25 0 0 0 0-.5Z" />
  </svg>
);

const ChevronDown = ({ rotated = false }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#9ca3af"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{
      transform: rotated ? "rotate(180deg)" : "none",
      transition: "transform 0.2s",
    }}
  >
    <path d="M8 10l4 4 4-4" />
  </svg>
);

const ChevronRight = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10 8l4 4-4 4" />
  </svg>
);

const WaveEmoji = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="28"
    height="28"
    fill="none"
    viewBox="0 0 33 36"
  >
    <g clipPath="url(#clip0)">
      <path
        fill="#FFB678"
        d="M15 35.2c1.4.8 3 1 4.4.7 2.1-.5 4-1.5 5.8-5.7 1.4-3.5 2.3-10.9 2.3-10.9 0-.7-.3-1.4-1-1.5h-.1a1.4 1.4 0 0 0-1.3 1l-2 4.9a.3.3 0 0 1-.5-.1L21 10.1A1.4 1.4 0 0 0 18.2 9a1.4 1.4 0 0 0-1.3 1.4l.1 7.8a.1.1 0 0 1-.1.1l-2.2-9.5a1.4 1.4 0 0 0-2.7.6l1.2 8.7a.1.1 0 0 1-.1.1l-2.8-7.7a1.2 1.2 0 0 0-1.6-.7A1.3 1.3 0 0 0 9 11l2.3 10.3H11l-3-5.7a1 1 0 0 0-1.3-.5 1.1 1.1 0 0 0-.6 1.3c.7 2.2 2.5 7.7 3.8 11 1.6 4.3 3.1 6.5 5 7.6Z"
      />
      <path
        fill="#FF8950"
        d="M11.2 23.6a.2.2 0 0 1 0-.4s4-3 8.9-3.3a.2.2 0 1 1 0 .4c-4.7.2-8.7 3.2-8.7 3.3h-.2Z"
      />
      <path fill="#FB6096" d="M11.8 2.8h-2v2.5h2V2.8Z" />
      <path fill="#3893EA" d="m2.5 10.7-.4 1.6L0 10.8.5 9l2 1.6Z" />
      <path fill="#5DD470" d="m28.5 1.6.7 1.6-2.6.1-.7-1.6h2.6Z" />
    </g>
    <defs>
      <clipPath id="clip0">
        <rect width="32.7" height="36" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

// ── Circle Progress ───────────────────────────────────────────────────────────
function CircleProgress({ color, bgColor, value, current, total, label }) {
  const radius = 15;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <li style={styles.circleItem}>
      <div
        style={{
          position: "relative",
          width: 72,
          height: 72,
          margin: "0 auto",
        }}
      >
        <svg viewBox="-1 -1 34 34" width="72" height="72">
          <circle
            cx="16"
            cy="16"
            r={radius}
            fill="transparent"
            stroke={bgColor}
            strokeWidth="3"
          />
          <circle
            cx="16"
            cy="16"
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 16 16)"
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>
        <span style={styles.circleDigits}>
          <span style={{ fontSize: 11, fontWeight: 700 }}>{value}</span>
          <span style={{ fontSize: 9 }}>%</span>
        </span>
      </div>
      <div style={styles.circleLegend}>
        <span style={{ fontWeight: 700, color: "#111827" }}>{current}</span>
        <span style={{ color: "#9ca3af", fontSize: 12 }}> / {total}</span>
      </div>
      <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
        {label}
      </div>
    </li>
  );
}

// ── Mini Bar Chart ────────────────────────────────────────────────────────────
const barColors = {
  invites: "#7c5cfc",
  accepted: "#22d3ee",
  messages: "#f97316",
};

function BarChart({ chartData }) {
  const chartHeight = 160;
  if (chartData.length === 0) return null;
  const maxVal = Math.max(
    ...chartData.map((d) => Math.max(d.invites, d.accepted, d.messages, 1)),
  );
  return (
    <div style={{ overflowX: "auto" }}>
      <svg
        width="100%"
        viewBox={`0 0 ${chartData.length * 80 + 40} ${chartHeight + 40}`}
        style={{ minWidth: 480 }}
      >
        {[0, 1, 2, 3, 4].map((i) => {
          const y = chartHeight - (i / 4) * chartHeight + 10;
          return (
            <g key={i}>
              <line
                x1="40"
                y1={y}
                x2={chartData.length * 80 + 40}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              <text
                x="36"
                y={y + 4}
                textAnchor="end"
                fontSize="10"
                fill="#9ca3af"
              >
                {i}
              </text>
            </g>
          );
        })}
        {chartData.map((d, idx) => {
          const x = idx * 80 + 50;
          const barW = 8;
          const types = ["invites", "accepted", "messages"];
          return (
            <g key={d.day}>
              {types.map((t, ti) => {
                const h = Math.max((d[t] / maxVal) * chartHeight, 4);
                const y = chartHeight - h + 10;
                return (
                  <rect
                    key={t}
                    x={x + ti * 10}
                    y={y}
                    width={barW}
                    height={h}
                    fill={barColors[t]}
                    rx="3"
                    ry="3"
                  />
                );
              })}
              <text
                x={x + 12}
                y={chartHeight + 26}
                textAnchor="middle"
                fontSize="9"
                fill="#9ca3af"
              >
                {d.day}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── Notification Banner ───────────────────────────────────────────────────────
function NotificationBanner() {
  const [current, setCurrent] = useState(0);
  const notes = [
    {
      type: "danger",
      text: "There is no connection with your LinkedIn account.",
      action: "Connect now",
    },
    {
      type: "info",
      text: "Your campaigns are not operating since they're outside of working hours.",
      action: "Adjust my schedule",
    },
  ];
  const note = notes[current];

  return (
    <div style={styles.notifBanner}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
        <span
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: note.type === "danger" ? "#fef2f2" : "#eff6ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <LinkedInIcon />
        </span>
        <p style={{ margin: 0, fontSize: 13, color: "#374151" }}>
          {note.text}{" "}
          <button
            style={{
              background: "none",
              border: "none",
              color: "#7c5cfc",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 13,
              padding: 0,
            }}
          >
            {note.action}
          </button>
        </p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <button
          onClick={() =>
            setCurrent((c) => (c - 1 + notes.length) % notes.length)
          }
          style={styles.navBtn}
        >
          ‹
        </button>
        <span style={{ fontSize: 12, color: "#6b7280" }}>
          <b style={{ color: "#111827" }}>{current + 1}</b>/{notes.length}
        </span>
        <button
          onClick={() => setCurrent((c) => (c + 1) % notes.length)}
          style={styles.navBtn}
        >
          ›
        </button>
      </div>
    </div>
  );
}

// Main Dashboard
// Toggle/delete actions for a campaign row, reusing the same endpoints as the
// Campaigns page's table (activate/pause + delete), wired for use on the dashboard's
// "Recent campaigns" preview.
function CampaignRowActions({ campaign, onChanged }) {
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    setBusy(true);
    if (campaign.status === "active") {
      await fetch(`/api/campaigns/${campaign.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "paused" }),
      });
    } else {
      await fetch(`/api/campaigns/${campaign.id}/activate`, { method: "POST" });
    }
    onChanged();
    setBusy(false);
  };

  const remove = async () => {
    setBusy(true);
    await fetch(`/api/campaigns/${campaign.id}`, { method: "DELETE" });
    onChanged();
    setBusy(false);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <button
        onClick={toggle}
        disabled={busy}
        title={campaign.status === "active" ? "Pause campaign" : "Activate campaign"}
        style={{
          ...styles.toggle,
          background: campaign.status === "active" ? "#7c5cfc" : "#e5e7eb",
          cursor: busy ? "not-allowed" : "pointer",
        }}
      >
        <div
          style={{
            ...styles.toggleThumb,
            left: campaign.status === "active" ? 18 : 2,
          }}
        />
      </button>
      <button
        onClick={remove}
        disabled={busy}
        title="Remove campaign"
        style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
      >
        <TrashIcon />
      </button>
    </div>
  );
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

const DEFAULT_LIMITS = { connectionRequests: 5, messages: 5, emails: 20, profileViews: 5 };

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("7 days");
  const [summary, setSummary] = useState(null);
  const [limits, setLimits] = useState(DEFAULT_LIMITS);
  const tabs = [
    "Today",
    "Yesterday",
    "7 days",
    "30 days",
    "90 days",
    "Pick dates",
  ];

  const loadSummary = () => {
    fetch("/api/dashboard/summary")
      .then((res) => (res.ok ? res.json() : null))
      .then(setSummary);
  };

  useEffect(() => {
    loadSummary();
    fetch("/api/settings/limits")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setLimits(data));
  }, []);

  const stats = summary?.statsToday || { invitesSent: 0, messagesSent: 0, emailsSent: 0, profileViews: 0 };
  const pct = (value, max) => (max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0);

  return (
    <main style={styles.main}>
      {/* Notification */}
      <NotificationBanner />

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 700,
              color: "#111827",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {greeting()}, {summary?.greetingName || "there"}! <WaveEmoji />
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#9ca3af" }}>
            Here&apos;s what&apos;s happening with your LinkedIn account today
          </p>
        </div>
        <button
          style={styles.bellBtn}
          title="Notifications"
          aria-label="No new notifications"
        >
          <BellIcon />
        </button>
      </div>

      {/* Top grid: Statistics + Recent activity */}
      <div style={styles.topGrid}>
        {/* Statistics card */}
        <section style={styles.card}>
          <div style={styles.cardHead}>
            <h2 style={styles.cardTitle}>Statistics</h2>
            <a href="/dashboard/statistics" style={styles.viewMore}>
              View More
            </a>
          </div>
          <ul style={styles.circleList}>
            <CircleProgress
              color="#7c5cfc"
              bgColor="rgba(124,92,252,0.1)"
              value={pct(stats.invitesSent, limits.connectionRequests)}
              current={stats.invitesSent}
              total={limits.connectionRequests}
              label="Invites sent"
            />
            <CircleProgress
              color="#f97316"
              bgColor="rgba(249,115,22,0.1)"
              value={pct(stats.messagesSent, limits.messages)}
              current={stats.messagesSent}
              total={limits.messages}
              label="Messages sent"
            />
            <CircleProgress
              color="#f59e0b"
              bgColor="rgba(245,158,11,0.1)"
              value={pct(stats.emailsSent, limits.emails)}
              current={stats.emailsSent}
              total={limits.emails}
              label="Emails sent"
            />
            <CircleProgress
              color="#22c55e"
              bgColor="rgba(34,197,94,0.1)"
              value={pct(stats.profileViews, limits.profileViews)}
              current={stats.profileViews}
              total={limits.profileViews}
              label="Profile viewed"
            />
          </ul>
          <ul style={styles.notifyBox}>
            <li style={styles.notifyItem}>
              <span style={styles.notifyLabel}>PENDING INVITATIONS</span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: 6,
                }}
              >
                <span style={styles.notifyValue}>{summary?.pendingInvitations ?? 0}</span>
                <button style={styles.withdrawBtn}>Withdraw</button>
              </div>
            </li>
            <li style={styles.notifyItem}>
              <span style={styles.notifyLabel}>UNREAD MESSAGES</span>
              <span style={styles.notifyValue}>{summary?.unreadMessages ?? 0}</span>
            </li>
            <li style={{ ...styles.notifyItem, borderRight: "none" }}>
              <span style={styles.notifyLabel}>
                PROFILE VIEWS SINCE LAST WEEK
              </span>
              <span style={styles.notifyValue}>{summary?.profileViewsChangePct ?? 0} %</span>
            </li>
          </ul>
        </section>

        {/* Recent activity */}
        <section style={styles.card}>
          <h3 style={styles.cardTitle}>Recent activity</h3>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {(summary?.recentActivity?.length ? summary.recentActivity : []).map((item) => (
              <li key={item.id} style={styles.activityItem}>
                <span style={styles.activityIcon}>
                  <LinkedInIcon />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 13,
                      color: "#374151",
                      lineHeight: 1.5,
                    }}
                  >
                    {item.label}{" "}
                    <a href="/dashboard/leads" style={styles.link}>
                      {item.leadName}
                    </a>
                  </p>
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      marginTop: 2,
                      fontSize: 12,
                      color: "#9ca3af",
                      flexWrap: "wrap",
                    }}
                  >
                    <time>{new Date(item.occurredAt).toLocaleString()}</time>
                    <span>•</span>
                    <a href="/dashboard/campaigns" style={styles.link}>
                      {item.campaignName}
                    </a>
                  </div>
                </div>
              </li>
            ))}
            {summary && summary.recentActivity.length === 0 && (
              <li style={{ padding: "16px 0", fontSize: 13, color: "#9ca3af" }}>
                No activity yet — activate a campaign to see it here.
              </li>
            )}
          </ul>
        </section>
      </div>

      {/* Recent Campaigns */}
      <section style={styles.card}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <h2 style={styles.cardTitle}>Recent campaigns</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <a href="/dashboard/campaigns" style={styles.outlineBtn}>
              All campaigns
            </a>

            <Link href="/dashboard/new-campaign">
              <button
                className="transition text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm"
                style={{
                  background:
                    "linear-gradient(to right, rgb(127, 100, 245), rgb(174, 121, 248))",
                }}
              >
                New campaign
              </button>
            </Link>
          </div>
        </div>
        <div style={styles.campaignGrid}>
          <span style={styles.colHead}>Overview</span>
          <span style={styles.colHead}>Leads</span>
          <span style={styles.colHead}>LinkedIn</span>
          <span style={styles.colHead}>Status</span>
        </div>
        {/* Campaign items */}
        {(summary?.recentCampaigns?.length ? summary.recentCampaigns : []).map((c) => (
          <div key={c.id} style={styles.campaignItem}>
            <div style={{ gridArea: "main" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 8,
                }}
              >
                <a
                  href={`/dashboard/new-campaign?id=${c.id}`}
                  style={{
                    ...styles.link,
                    fontWeight: 600,
                    fontSize: 14,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  {c.name} <ChevronRight />
                </a>
                <InfoIcon size={16} />
              </div>
              {/* Progress bar */}
              <div
                style={{
                  display: "flex",
                  height: 6,
                  borderRadius: 4,
                  overflow: "hidden",
                  background: "#f3f4f6",
                  gap: 2,
                }}
              >
                <div
                  style={{ flex: c.inProgress || 1, background: "#f97316", borderRadius: 4 }}
                  title={`In progress: ${c.inProgress}`}
                />
                <div
                  style={{ flex: c.remaining || 1, background: "#fcd9c0", borderRadius: 4 }}
                  title={`Remaining: ${c.remaining}`}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  marginTop: 4,
                  fontSize: 12,
                  color: "#9ca3af",
                }}
              >
                <span style={{ color: "#f97316", fontWeight: 700 }}>{c.inProgress}</span>
                <span style={{ color: "#fcd9c0", fontWeight: 700 }}>{c.remaining}</span>
              </div>
            </div>
            <div style={{ gridArea: "leads" }}>
              <p style={styles.statCaption}>Leads</p>
              <div style={styles.statRow}>
                <span style={{ fontSize: 13, color: "#6b7280" }}>All leads</span>
                <a href="/dashboard/leads" style={styles.link}>
                  {c.totalLeads}
                </a>
              </div>
              <div style={styles.statRow}>
                <span style={{ fontSize: 13, color: "#6b7280" }}>Status</span>
                <span style={{ fontWeight: 600, textTransform: "capitalize" }}>{c.status}</span>
              </div>
            </div>
            <div style={{ gridArea: "linkedin" }}>
              <p style={styles.statCaption}>LinkedIn</p>
              <div style={styles.statRow}>
                <span style={{ fontSize: 13, color: "#6b7280" }}>
                  Acceptance rate
                </span>
                <span style={{ fontWeight: 600 }} title="Not trackable in mock mode: the LinkedIn connector doesn't simulate a separate async acceptance event">
                  —
                </span>
              </div>
              <div style={styles.statRow}>
                <span
                  style={{
                    fontSize: 13,
                    color: "#6b7280",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  Response rate <InfoIcon />
                </span>
                <span style={{ fontWeight: 600 }}>
                  {c.totalLeads > 0 ? `${Math.round((c.repliedCount / c.totalLeads) * 100)}%` : "0%"}
                </span>
              </div>
            </div>
            <div
              style={{
                gridArea: "status",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                alignItems: "flex-end",
              }}
            >
              <CampaignRowActions campaign={c} onChanged={loadSummary} />
              <time style={{ fontSize: 12, color: "#9ca3af" }}>
                {new Date(c.createdAt).toLocaleDateString()}
              </time>
            </div>
          </div>
        ))}
        {summary && summary.recentCampaigns.length === 0 && (
          <p style={{ padding: "24px 0", textAlign: "center", fontSize: 13, color: "#9ca3af" }}>
            No campaigns yet — create your first one to get started.
          </p>
        )}
      </section>

      {/* Teams + Chart */}
      <section style={styles.card}>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {/* Teams sidebar */}
          <div style={{ minWidth: 200, flex: "0 0 220px" }}>
            <h2 style={{ ...styles.cardTitle, marginBottom: 12 }}>Teams</h2>
            <div style={styles.teamItem}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={styles.teamIcon}>
                  <TeamIcon />
                </span>
                <div>
                  <div
                    style={{ fontWeight: 600, fontSize: 14, color: "#7c5cfc" }}
                  >
                    {summary?.team?.name || "Default"}
                  </div>
                </div>
              </div>
              <a
                href="/dashboard/teams"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  color: "#6b7280",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "4px 0",
                  textDecoration: "none",
                }}
              >
                {summary?.team?.memberCount ?? 1} member{(summary?.team?.memberCount ?? 1) === 1 ? "" : "s"}{" "}
                <ChevronDown rotated />
              </a>
            </div>
            <div style={styles.memberItem}>
              <div style={styles.avatar}>{summary?.team?.firstMember?.initial || "?"}</div>
              <div>
                <div
                  style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}
                >
                  {summary?.team?.firstMember?.name || "..."}
                </div>
                <div style={{ fontSize: 11, color: "#9ca3af" }}>Owner</div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ width: 1, background: "#e5e7eb", flexShrink: 0 }} />

          {/* Chart */}
          <div style={{ flex: 1, minWidth: 300 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {tabs.map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    style={{
                      ...styles.tabBtn,
                      ...(activeTab === t ? styles.tabBtnActive : {}),
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <a href="/teams/27476" style={styles.outlineBtn}>
                View team
              </a>
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#111827",
                marginBottom: 12,
              }}
            >
              Default
            </div>

            <BarChart chartData={summary?.weeklyChart || []} />

            {/* Legend */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
                marginTop: 8,
              }}
            >
              {[
                { label: "Invites sent", color: "#7c5cfc" },
                { label: "Invites accepted", color: "#22d3ee" },
                { label: "Messaged", color: "#f97316" },
                { label: "InMailed", color: "#6366f1" },
                { label: "Leads replied", color: "#22c55e" },
                { label: "Emails sent", color: "#f59e0b" },
                { label: "Profiles followed", color: "#ec4899" },
                { label: "Endorsed", color: "#8b5cf6" },
                { label: "Liked", color: "#14b8a6" },
                { label: "Profiles viewed", color: "#84cc16" },
              ].map(({ label, color }) => (
                <span
                  key={label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 11,
                    color: "#374151",
                  }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: color,
                      display: "inline-block",
                    }}
                  />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

// Styles
const styles = {
  main: {
    margin: "0 auto",
    padding: "16px 24px 40px",
    background: "#f9fafb",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  notifBanner: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: "12px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  },
  navBtn: {
    background: "#f3f4f6",
    border: "none",
    borderRadius: 6,
    width: 24,
    height: 24,
    cursor: "pointer",
    fontSize: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#374151",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  bellBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 6,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  topGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 340px",
    gap: 20,
  },
  card: {
    background: "#fff",
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    border: "1px solid #e5e7eb",
  },
  cardHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: 700,
    color: "#111827",
  },
  viewMore: {
    fontSize: 13,
    color: "#7c5cfc",
    textDecoration: "none",
    fontWeight: 500,
  },
  link: {
    color: "#7c5cfc",
    textDecoration: "none",
    fontWeight: 500,
  },
  circleList: {
    listStyle: "none",
    padding: 0,
    margin: "0 0 20px",
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 8,
    textAlign: "center",
  },
  circleItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    padding: "12px 8px",
    borderRadius: 12,
    background: "#fafafa",
  },
  circleDigits: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 700,
    color: "#111827",
  },
  circleLegend: {
    fontSize: 14,
    marginTop: 4,
  },
  notifyBox: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    overflow: "hidden",
  },
  notifyItem: {
    padding: "14px 16px",
    borderRight: "1px solid #e5e7eb",
  },
  notifyLabel: {
    fontSize: 10,
    fontWeight: 600,
    color: "#9ca3af",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    display: "block",
    marginBottom: 8,
  },
  notifyValue: {
    fontSize: 28,
    fontWeight: 700,
    color: "#111827",
    display: "block",
    marginTop: 4,
  },
  withdrawBtn: {
    border: "1.5px solid #d1d5db",
    background: "#fff",
    borderRadius: 8,
    padding: "6px 14px",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    color: "#374151",
  },
  activityItem: {
    display: "flex",
    gap: 12,
    padding: "12px 0",
    borderBottom: "1px solid #f3f4f6",
    alignItems: "flex-start",
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    background: "#f3f4f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    color: "#374151",
  },
  campaignGrid: {
    display: "grid",
    gridTemplateColumns: "3fr 1.5fr 1.5fr 1fr",
    gap: 12,
    padding: "8px 0",
    borderBottom: "1px solid #e5e7eb",
    marginBottom: 12,
  },
  colHead: {
    fontSize: 12,
    color: "#9ca3af",
    fontWeight: 500,
  },
  campaignItem: {
    display: "grid",
    gridTemplateColumns: "3fr 1.5fr 1.5fr 1fr",
    gridTemplateAreas: '"main leads linkedin status"',
    gap: 12,
    padding: "16px 0",
    alignItems: "start",
  },
  statCaption: {
    margin: "0 0 8px",
    fontSize: 11,
    fontWeight: 600,
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  statRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
    gap: 8,
  },
  toggle: {
    width: 36,
    height: 20,
    background: "#e5e7eb",
    borderRadius: 20,
    position: "relative",
    cursor: "not-allowed",
  },
  toggleThumb: {
    position: "absolute",
    top: 2,
    width: 16,
    height: 16,
    background: "#fff",
    borderRadius: "50%",
    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
  },
  teamItem: {
    background: "#f5f3ff",
    borderRadius: 10,
    padding: "10px 12px",
    marginBottom: 8,
    border: "1px solid #ede9fe",
  },
  teamIcon: {
    width: 32,
    height: 32,
    background: "#7c5cfc",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
  },
  memberItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "8px 4px",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "#d1d5db",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 700,
    color: "#374151",
  },
  tabBtn: {
    border: "1.5px solid #e5e7eb",
    background: "#fff",
    borderRadius: 8,
    padding: "6px 12px",
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    color: "#6b7280",
    transition: "all 0.15s",
  },
  tabBtnActive: {
    background: "#111827",
    color: "#fff",
    borderColor: "#111827",
  },
  outlineBtn: {
    border: "1.5px solid #d1d5db",
    background: "#fff",
    borderRadius: 8,
    padding: "7px 14px",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    color: "#374151",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
  },
};
