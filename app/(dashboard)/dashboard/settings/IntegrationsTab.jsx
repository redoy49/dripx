"use client";

import { useEffect, useState } from "react";
import { Webhook, Database, Sheet, Plus, Trash2, Copy } from "lucide-react";
import Badge from "@/app/components/ui/Badge";
import GradientButton from "@/app/components/ui/GradientButton";

function IntegrationCard({ icon: Icon, title, description, status, children }) {
  return (
    <div className="rounded-2xl border border-gray-100 p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
            <Icon size={18} className="text-gray-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">{title}</p>
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
          <p className="mb-1 text-xs font-medium text-gray-500">
            Inbound URL — POST a lead payload here to create a lead (use as a Zapier &quot;Webhooks by Zapier&quot; action target)
          </p>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={inboundUrl}
              className="flex-1 truncate rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-500"
            />
            <button
              onClick={() => navigator.clipboard?.writeText(inboundUrl)}
              className="rounded-lg border border-gray-200 p-2 text-gray-400 hover:bg-gray-50"
              title="Copy"
            >
              <Copy size={14} />
            </button>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <p className="mb-2 text-xs font-medium text-gray-500">Outbound webhooks</p>

          {!loading &&
            webhooks.map((w) => (
              <div key={w.id} className="mb-2 flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-gray-700">{w.url}</p>
                  <p className="text-[11px] text-gray-400">{w.events.join(", ")}</p>
                </div>
                <button onClick={() => deleteWebhook(w.id)} className="text-gray-300 hover:text-red-400">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}

          <div className="mt-3 space-y-2">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://hooks.zapier.com/..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-700 outline-none focus:border-[#6367FF]/40"
            />
            <div className="flex flex-wrap gap-1.5">
              {availableEvents.map((event) => (
                <button
                  key={event}
                  onClick={() => toggleEvent(event)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                    selectedEvents.includes(event)
                      ? "bg-[#6367FF]/10 text-[#6367FF]"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {event}
                </button>
              ))}
            </div>
            <button
              onClick={createWebhook}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              <Plus size={13} /> Add webhook
            </button>
          </div>
        </div>
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
          <a href="/api/integrations/hubspot/connect">
            <GradientButton>Connect HubSpot</GradientButton>
          </a>
        ) : (
          <GradientButton disabled>
            {status === "connected" ? "Connected" : "Connect HubSpot"}
          </GradientButton>
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
      <div className="mt-4 space-y-2">
        {!configured && (
          <p className="text-xs text-amber-600">
            Add GOOGLE_SERVICE_ACCOUNT_KEY to .env.local to enable exports.
          </p>
        )}
        <input
          value={spreadsheetId}
          onChange={(e) => setSpreadsheetId(e.target.value)}
          placeholder="Spreadsheet ID (from its URL)"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-700 outline-none focus:border-[#6367FF]/40"
        />
        <button
          onClick={save}
          disabled={saving}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </IntegrationCard>
  );
}

export default function IntegrationsTab() {
  return (
    <div className="grid grid-cols-1 gap-4 p-8 lg:grid-cols-3">
      <WebhooksCard />
      <HubSpotCard />
      <GoogleSheetsCard />
    </div>
  );
}
