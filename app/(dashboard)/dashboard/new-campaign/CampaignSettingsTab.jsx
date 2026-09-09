"use client";

import { useState } from "react";
import { Loader2, Play, Pause } from "lucide-react";
import { ToggleGreen } from "@/app/components/ui/Toggle";
import Badge from "@/app/components/ui/Badge";

const CHANNELS = [
  { key: "linkedin", label: "LinkedIn" },
  { key: "email", label: "Email" },
];

const OVERRIDE_FIELDS = [
  { key: "connectionRequests", label: "Connection requests" },
  { key: "messages", label: "Messages" },
  { key: "inmails", label: "InMails" },
  { key: "profileViews", label: "Profile views" },
  { key: "likes", label: "Likes" },
  { key: "emails", label: "Emails" },
];

const STATUS_BADGE = {
  draft: "gray",
  active: "green",
  paused: "amber",
  completed: "violet",
};

export default function CampaignSettingsTab({ campaignId, campaign, onCampaignChange }) {
  const [name, setName] = useState(campaign.name);
  const [channels, setChannels] = useState(campaign.channels);
  const [overrideOn, setOverrideOn] = useState(!!campaign.dailyLimitsOverride);
  const [overrideValues, setOverrideValues] = useState(
    campaign.dailyLimitsOverride || { connectionRequests: 5, messages: 5, inmails: 5, profileViews: 5, likes: 5, emails: 20 },
  );
  const [saving, setSaving] = useState(false);
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState("");

  const patchCampaign = async (body) => {
    const res = await fetch(`/api/campaigns/${campaignId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (res.ok) onCampaignChange(data);
    return { ok: res.ok, data };
  };

  const handleSaveDetails = async () => {
    setSaving(true);
    await patchCampaign({
      name,
      channels,
      dailyLimitsOverride: overrideOn ? overrideValues : null,
    });
    setSaving(false);
  };

  const toggleChannel = (key) => {
    setChannels((prev) => (prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]));
  };

  const handleActivate = async () => {
    setActivating(true);
    setError("");
    const res = await fetch(`/api/campaigns/${campaignId}/activate`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      onCampaignChange(data.campaign);
    } else {
      setError(data.message || "Failed to activate campaign");
    }
    setActivating(false);
  };

  const handlePause = async () => {
    setActivating(true);
    await patchCampaign({ status: "paused" });
    setActivating(false);
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Campaign settings</h2>
          <p className="text-xs text-gray-400">Name, channels, and per-campaign limit overrides.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge color={STATUS_BADGE[campaign.status] || "gray"}>{campaign.status}</Badge>

          {campaign.status === "active" ? (
            <button
              onClick={handlePause}
              disabled={activating}
              className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-60"
            >
              {activating ? <Loader2 size={15} className="animate-spin" /> : <Pause size={15} />}
              Pause
            </button>
          ) : (
            <button
              onClick={handleActivate}
              disabled={activating}
              className="flex items-center gap-2 rounded-xl bg-[#6367FF] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5254e8] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {activating ? <Loader2 size={15} className="animate-spin" /> : <Play size={15} />}
              Activate
            </button>
          )}
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      <div className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Campaign name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full max-w-md rounded-xl border border-gray-200 bg-gray-50/60 px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#6367FF]/40 focus:bg-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Channels</label>
          <div className="flex gap-3">
            {CHANNELS.map((c) => (
              <button
                key={c.key}
                onClick={() => toggleChannel(c.key)}
                className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                  channels.includes(c.key)
                    ? "border-[#6367FF] bg-[#6367FF]/[0.06] text-[#6367FF]"
                    : "border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Override workspace daily limits</p>
              <p className="text-xs text-gray-400">
                By default this campaign shares your workspace&apos;s Settings &gt; Limits caps.
              </p>
            </div>
            <ToggleGreen checked={overrideOn} onChange={() => setOverrideOn((v) => !v)} />
          </div>

          {overrideOn && (
            <div className="grid grid-cols-3 gap-4">
              {OVERRIDE_FIELDS.map((f) => (
                <div key={f.key}>
                  <label className="mb-1 block text-xs font-medium text-gray-500">{f.label}</label>
                  <input
                    type="number"
                    min={0}
                    value={overrideValues[f.key] ?? 0}
                    onChange={(e) =>
                      setOverrideValues((prev) => ({ ...prev, [f.key]: Number(e.target.value) }))
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#6367FF]/40"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleSaveDetails}
          disabled={saving}
          className="rounded-xl bg-[#6367FF] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5254e8] disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save settings"}
        </button>
      </div>
    </div>
  );
}
