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
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-gray-200/90 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-900">Edit LinkedIn Profile Details</h3>
            <p className="text-xs text-gray-400 mt-0.5">Update your outreach identity and LinkedIn link</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200/90 bg-white text-gray-400 hover:text-gray-700 shadow-2xs transition active:scale-95 cursor-pointer"
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
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Display Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-full border border-gray-200/90 bg-white px-4 py-2.5 text-xs text-gray-800 shadow-2xs outline-none transition focus:border-indigo-400"
              placeholder="e.g. Redoy Al Hasan"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">LinkedIn Profile URL</label>
            <div className="relative">
              <input
                type="url"
                required
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="w-full rounded-full border border-gray-200/90 bg-white pl-4 pr-9 py-2.5 text-xs text-gray-800 shadow-2xs outline-none transition focus:border-indigo-400"
                placeholder="https://www.linkedin.com/in/username"
              />
              <ExternalLink size={13} className="absolute right-3.5 top-3 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Professional Headline / Role</label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full rounded-full border border-gray-200/90 bg-white px-4 py-2.5 text-xs text-gray-800 shadow-2xs outline-none transition focus:border-indigo-400"
              placeholder="e.g. Growth Specialist & Founder"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">LinkedIn Network Size / Connections</label>
            <input
              type="number"
              min="0"
              value={connectionsCount}
              onChange={(e) => setConnectionsCount(e.target.value)}
              className="w-full rounded-full border border-gray-200/90 bg-white px-4 py-2.5 text-xs text-gray-800 shadow-2xs outline-none transition focus:border-indigo-400"
              placeholder="e.g. 3224"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-gray-200/90 bg-white px-5 py-2 text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 active:scale-95 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-full bg-indigo-400 hover:bg-indigo-500 px-6 py-2 text-xs font-bold text-white shadow-sm active:scale-95 transition disabled:opacity-50 cursor-pointer"
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
