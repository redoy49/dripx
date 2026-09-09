"use client";

import { useState } from "react";
import { X } from "lucide-react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 p-6 backdrop-blur-[3px]">
      <div className="modal-enter w-full max-w-md overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/60 px-6 py-4">
          <h2 className="text-sm font-semibold text-gray-800">Invite team member</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={16} strokeWidth={2.2} />
          </button>
        </div>

        <div className="space-y-4 p-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teammate@company.com"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#6367FF]/40"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#6367FF]/40"
            >
              <option value="member">Member — view campaigns and inbox</option>
              <option value="admin">Admin — manage campaigns, leads, and team</option>
            </select>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleInvite}
              disabled={loading || !email}
              className="rounded-xl bg-[#6367FF] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5254e8] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send invite"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
