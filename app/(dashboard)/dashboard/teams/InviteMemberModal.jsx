"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";

export default function InviteMemberModal({ open, onClose, onInvited }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleInvite = async () => {
    setLoading(true);
    setError("");
    const res = await fetch("/api/team/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "Failed to invite member");
      setLoading(false);
      return;
    }

    setEmail("");
    setRole("member");
    setLoading(false);
    onInvited?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-xs">
      <div className="modal-enter w-full max-w-md overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/60 px-6 py-4">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Invite Team Member</h2>
            <p className="text-[11px] text-gray-400">Send an invitation to join your workspace</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200/90 bg-white text-gray-400 hover:text-gray-700 shadow-2xs transition active:scale-95 cursor-pointer"
          >
            <X size={16} strokeWidth={2.2} />
          </button>
        </div>

        <div className="space-y-4 p-6">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teammate@company.com"
              className="w-full rounded-full border border-gray-200/90 bg-white px-4 py-2.5 text-xs text-gray-800 shadow-2xs outline-none transition focus:border-indigo-400"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">Role & Access</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-full border border-gray-200/90 bg-white px-4 py-2.5 text-xs font-semibold text-gray-800 shadow-2xs outline-none transition focus:border-indigo-400 cursor-pointer"
            >
              <option value="member">Member — view campaigns and inbox</option>
              <option value="admin">Admin — manage campaigns, leads, and team</option>
            </select>
          </div>

          {error && <p className="text-xs font-semibold text-rose-500">{error}</p>}

          <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
            <button
              onClick={onClose}
              className="rounded-full border border-gray-200/90 bg-white px-5 py-2 text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 active:scale-95 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleInvite}
              disabled={loading || !email}
              className="inline-flex items-center gap-1.5 rounded-full bg-indigo-400 hover:bg-indigo-500 px-6 py-2 text-xs font-bold text-white shadow-sm transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              {loading && <Loader2 size={13} className="animate-spin" />}
              <span>{loading ? "Sending..." : "Send Invite"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
