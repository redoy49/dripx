"use client";

import { useState, useEffect } from "react";
import { X, Play, Loader2, Megaphone, CheckCircle2 } from "lucide-react";

export default function BulkEnrollModal({ isOpen, onClose, selectedLeadIds, onEnrolled }) {
  const [campaigns, setCampaigns] = useState(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const loading = campaigns === null;

  useEffect(() => {
    if (!isOpen) return;
    let ignore = false;
    fetch("/api/campaigns")
      .then((res) => res.json())
      .then((data) => {
        if (ignore) return;
        const list = data.items || [];
        setCampaigns(list);
        if (list.length > 0) setSelectedCampaignId(list[0].id);
      })
      .catch((err) => {
        if (ignore) return;
        console.error("Failed to load campaigns:", err);
        setCampaigns([]);
      });

    return () => {
      ignore = true;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleEnroll = async () => {
    if (!selectedCampaignId) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/leads/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "enroll",
          leadIds: selectedLeadIds,
          campaignId: selectedCampaignId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to enroll leads");

      onEnrolled?.(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCampaign = Array.isArray(campaigns)
    ? campaigns.find((c) => c.id === selectedCampaignId) || null
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-violet-50/50 to-indigo-50/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-600 text-white flex items-center justify-center shadow-xs">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Bulk Enroll in Campaign</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Add {selectedLeadIds.length} selected prospect{selectedLeadIds.length > 1 ? "s" : ""} to a campaign.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-white/80 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-xs text-rose-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Select Target Campaign
            </label>
            {loading ? (
              <div className="py-6 flex items-center justify-center gap-2 text-xs text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
                <span>Loading campaigns...</span>
              </div>
            ) : campaigns.length === 0 ? (
              <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-100">
                No campaigns found. Please create a campaign first.
              </p>
            ) : (
              <select
                value={selectedCampaignId}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-violet-400"
              >
                {campaigns.map((c, idx) => (
                  <option key={c.id ? `${c.id}-${idx}` : idx} value={c.id}>
                    {c.name} ({c.status})
                  </option>
                ))}
              </select>
            )}
          </div>

          {selectedCampaign && (
            <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-gray-500">
                <span>Campaign Status:</span>
                <span className={`capitalize font-semibold ${
                  selectedCampaign.status === "active" ? "text-emerald-600" : "text-gray-700"
                }`}>
                  {selectedCampaign.status}
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                {selectedCampaign.status === "active"
                  ? "✓ Because this campaign is active, outreach sequence jobs will be queued immediately."
                  : "Prospects will be enrolled in 'pending' status until the campaign is activated."}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            onClick={handleEnroll}
            disabled={submitting || !selectedCampaignId || campaigns.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-xs transition disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>Enroll {selectedLeadIds.length} Leads</span>
          </button>
        </div>
      </div>
    </div>
  );
}
