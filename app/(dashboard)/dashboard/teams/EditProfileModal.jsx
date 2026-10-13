"use client";

import { useState } from "react";
import { X, ExternalLink, Loader2 } from "lucide-react";

export default function EditProfileModal({ isOpen, onClose, user, onUpdated }) {
  const [name, setName] = useState(user?.name || "");
  const [linkedinUrl, setLinkedinUrl] = useState(user?.linkedinUrl || "");
  const [headline, setHeadline] = useState(user?.headline || "");
  const [connectionsCount, setConnectionsCount] = useState(user?.connectionsCount || 3224);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/team/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          linkedinUrl: linkedinUrl.trim(),
          headline: headline.trim(),
          connectionsCount: Number(connectionsCount) || 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");

      onUpdated?.();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-800">Edit LinkedIn Profile Details</h3>
            <p className="text-xs text-gray-400 mt-0.5">Update your outreach identity and LinkedIn link</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
          >
            <X size={16} />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Display Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-xs text-gray-800 outline-none focus:border-[#6367FF]"
              placeholder="e.g. Redoy Al Hasan"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">LinkedIn Profile URL</label>
            <div className="relative">
              <input
                type="url"
                required
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="w-full rounded-xl border border-gray-200 pl-3.5 pr-8 py-2 text-xs text-gray-800 outline-none focus:border-[#6367FF]"
                placeholder="https://www.linkedin.com/in/username"
              />
              <ExternalLink size={13} className="absolute right-3 top-2.5 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Professional Headline / Role</label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-xs text-gray-800 outline-none focus:border-[#6367FF]"
              placeholder="e.g. Growth Specialist & Founder"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">LinkedIn Network Size / Connections</label>
            <input
              type="number"
              min="0"
              value={connectionsCount}
              onChange={(e) => setConnectionsCount(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-xs text-gray-800 outline-none focus:border-[#6367FF]"
              placeholder="e.g. 3224"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-gray-200 bg-white px-5 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#6367FF] px-6 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#5254e8] disabled:opacity-50 transition"
            >
              {loading && <Loader2 size={13} className="animate-spin" />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
