"use client";

import { useEffect, useState } from "react";
import { Webhook, Database, Sheet, Plus, Trash2, Copy } from "lucide-react";
import { FiLinkedin } from "react-icons/fi";
import Badge from "@/app/components/ui/Badge";

function IntegrationCard({ icon: Icon, title, description, status, children }) {
  return (
    <div className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-2xs">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-400">
            <Icon size={18} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">{title}</p>
            <p className="text-xs text-gray-400">{description}</p>
          </div>
        </div>
        <Badge color={status === "connected" ? "green" : "gray"}>
          {status === "connected" ? "Connected" : "Not connected"}
        </Badge>
      </div>
      {children}
    </div>
  );
}

function WebhooksCard() {
  const [webhooks, setWebhooks] = useState([]);
  const [availableEvents, setAvailableEvents] = useState([]);
  const [url, setUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [inboundUrl, setInboundUrl] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch("/api/webhooks")
      .then((res) => res.json())
      .then((data) => {
        setWebhooks(data.items || []);
        setAvailableEvents(data.availableEvents || []);
        setLoading(false);
      });
  };

  useEffect(() => {
    load();
    fetch("/api/integrations/inbound-token")
      .then((res) => res.json())
      .then((data) => setInboundUrl(data.url));
  }, []);

  const toggleEvent = (event) => {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event],
    );
  };

  const createWebhook = async () => {
    if (!url || selectedEvents.length === 0) return;
    const res = await fetch("/api/webhooks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, events: selectedEvents }),
    });
    if (res.ok) {
      setUrl("");
      setSelectedEvents([]);
      load();
    }
  };

  const deleteWebhook = async (id) => {
    await fetch(`/api/webhooks/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <IntegrationCard
      icon={Webhook}
      title="Zapier / Webhooks"
      description="Send DripX events out, or create leads in DripX from anywhere"
      status={webhooks.some((w) => w.status === "active") ? "connected" : "disconnected"}
    >
      <div className="mt-4 space-y-4">
        <div>
          <p className="mb-1.5 text-xs font-semibold text-gray-500">
            Inbound URL — POST a lead payload here to create a lead
          </p>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={inboundUrl}
              className="flex-1 truncate rounded-full border border-gray-200/90 bg-gray-50/70 px-4 py-2 text-xs font-medium text-gray-600 shadow-2xs"
            />
            <button
              onClick={() => navigator.clipboard?.writeText(inboundUrl)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200/90 bg-white text-gray-500 shadow-2xs transition hover:bg-gray-50 active:scale-95 cursor-pointer"
              title="Copy URL"
            >
              <Copy size={14} />
            </button>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <p className="mb-2 text-xs font-semibold text-gray-700">Outbound Webhooks</p>

          {!loading &&
            webhooks.map((w) => (
              <div key={w.id} className="mb-2 flex items-center justify-between rounded-xl border border-gray-200/90 bg-gray-50/50 px-3.5 py-2 shadow-2xs">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-gray-800">{w.url}</p>
                  <p className="text-[11px] text-gray-400">{w.events.join(", ")}</p>
                </div>
                <button
                  onClick={() => deleteWebhook(w.id)}
                  className="rounded-full p-1.5 text-gray-400 hover:bg-rose-50 hover:text-rose-500 transition cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}

          <div className="mt-3 space-y-2.5">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://hooks.zapier.com/..."
              className="w-full rounded-full border border-gray-200/90 bg-white px-4 py-2 text-xs font-medium text-gray-800 shadow-2xs outline-none transition focus:border-indigo-400"
            />
            <div className="flex flex-wrap gap-1.5">
              {availableEvents.map((event) => {
                const isSelected = selectedEvents.includes(event);
                return (
                  <button
                    key={event}
                    onClick={() => toggleEvent(event)}
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold transition cursor-pointer ${
                      isSelected
                        ? "bg-indigo-50 text-indigo-500 border border-indigo-200 shadow-2xs"
                        : "border border-gray-200/90 bg-white text-gray-600 hover:bg-gray-50 shadow-2xs"
                    }`}
                  >
                    {event}
                  </button>
                );
              })}
            </div>
            <button
              onClick={createWebhook}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200/90 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 active:scale-95 transition cursor-pointer"
            >
              <Plus size={14} /> <span>Add webhook</span>
            </button>
          </div>
        </div>
      </div>
    </IntegrationCard>
  );
}

function LinkedInCard() {
  const [status, setStatus] = useState("disconnected");
  const [lastError, setLastError] = useState(null);
  const [configured, setConfigured] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);

  const load = () => {
    fetch("/api/integrations/unipile")
      .then((res) => res.json())
      .then((data) => {
        setStatus(data.status);
        setLastError(data.lastError);
        setConfigured(data.serverConfigured);
      });
  };

  useEffect(() => {
    load();
  }, []);

  const disconnect = async () => {
    setDisconnecting(true);
    await fetch("/api/integrations/unipile", { method: "DELETE" });
    load();
    setDisconnecting(false);
  };

  return (
    <IntegrationCard
      icon={FiLinkedin}
      title="LinkedIn (via Unipile)"
      description="Connect a real LinkedIn account to run live campaigns"
      status={status === "connected" ? "connected" : "disconnected"}
    >
      <div className="mt-4">
        {!configured && (
          <p className="mb-3 text-xs text-amber-600">
            Add UNIPILE_DSN / UNIPILE_API_KEY to .env.local to enable this.
          </p>
        )}
        {status === "error" && lastError && (
          <p className="mb-3 text-xs text-rose-500">{lastError}</p>
        )}

        {configured && status !== "connected" && (
          <a
            href="/api/integrations/unipile/connect"
            className="inline-flex items-center justify-center rounded-full bg-indigo-400 hover:bg-indigo-500 px-5 py-2 text-xs font-bold text-white shadow-sm transition active:scale-95 cursor-pointer"
          >
            {status === "connecting" ? "Finish connecting..." : "Connect LinkedIn"}
          </a>
        )}
        {status === "connected" && (
          <button
            onClick={disconnect}
            disabled={disconnecting}
            className="rounded-full border border-gray-200/90 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 active:scale-95 transition disabled:opacity-60 cursor-pointer"
          >
            {disconnecting ? "Disconnecting..." : "Disconnect"}
          </button>
        )}
      </div>
    </IntegrationCard>
  );
}

function HubSpotCard() {
  const [status, setStatus] = useState("disconnected");
  const [configured, setConfigured] = useState(true);

  useEffect(() => {
    fetch("/api/integrations/hubspot")
      .then((res) => res.json())
      .then((data) => {
        setStatus(data.status);
        setConfigured(data.serverConfigured);
      });
  }, []);

  return (
    <IntegrationCard icon={Database} title="HubSpot" description="Sync leads to HubSpot contacts" status={status}>
      <div className="mt-4">
        {!configured && (
          <p className="mb-3 text-xs text-amber-600">
            Add HUBSPOT_CLIENT_ID / HUBSPOT_CLIENT_SECRET / HUBSPOT_REDIRECT_URI to .env.local to enable this.
          </p>
        )}
        {configured && status !== "connected" ? (
          <a
            href="/api/integrations/hubspot/connect"
            className="inline-flex items-center justify-center rounded-full bg-indigo-400 hover:bg-indigo-500 px-5 py-2 text-xs font-bold text-white shadow-sm transition active:scale-95 cursor-pointer"
          >
            Connect HubSpot
          </a>
        ) : (
          <button
            disabled
            className="rounded-full border border-gray-200/90 bg-gray-50 px-5 py-2 text-xs font-semibold text-gray-400 shadow-2xs cursor-not-allowed"
          >
            {status === "connected" ? "Connected" : "Connect HubSpot"}
          </button>
        )}
      </div>
    </IntegrationCard>
  );
}

function GoogleSheetsCard() {
  const [spreadsheetId, setSpreadsheetId] = useState("");
  const [status, setStatus] = useState("disconnected");
  const [configured, setConfigured] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/integrations/google-sheets")
      .then((res) => res.json())
      .then((data) => {
        setSpreadsheetId(data.spreadsheetId || "");
        setStatus(data.status);
        setConfigured(data.serverConfigured);
      });
  }, []);

  const save = async () => {
    setSaving(true);
    const res = await fetch("/api/integrations/google-sheets", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spreadsheetId }),
    });
    if (res.ok) setStatus(spreadsheetId ? "connected" : "disconnected");
    setSaving(false);
  };

  return (
    <IntegrationCard icon={Sheet} title="Google Sheets" description="Export leads to a spreadsheet" status={status}>
      <div className="mt-4 space-y-2.5">
        {!configured && (
          <p className="text-xs text-amber-600">
            Add GOOGLE_SERVICE_ACCOUNT_KEY to .env.local to enable exports.
          </p>
        )}
        <input
          value={spreadsheetId}
          onChange={(e) => setSpreadsheetId(e.target.value)}
          placeholder="Spreadsheet ID (from its URL)"
          className="w-full rounded-full border border-gray-200/90 bg-white px-4 py-2 text-xs font-medium text-gray-800 shadow-2xs outline-none transition focus:border-indigo-400"
        />
        <button
          onClick={save}
          disabled={saving}
          className="rounded-full border border-gray-200/90 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 active:scale-95 transition disabled:opacity-60 cursor-pointer"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </IntegrationCard>
  );
}

export default function IntegrationsTab() {
  return (
    <div className="grid grid-cols-1 gap-6 p-6 lg:p-8 lg:grid-cols-2">
      <LinkedInCard />
      <WebhooksCard />
      <HubSpotCard />
      <GoogleSheetsCard />
    </div>
  );
}
