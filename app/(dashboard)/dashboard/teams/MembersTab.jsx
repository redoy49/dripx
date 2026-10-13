/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { UserPlus, ExternalLink } from "lucide-react";
import Badge from "@/app/components/ui/Badge";
import InviteMemberModal from "@/app/(dashboard)/dashboard/teams/InviteMemberModal";

const ROLE_BADGE = { owner: "violet", admin: "green", member: "gray" };

export default function MembersTab({ currentRole }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);

  const canManage = currentRole === "owner" || currentRole === "admin";

  const load = () => {
    fetch("/api/team/members")
      .then((res) => res.json())
      .then((data) => {
        setMembers(data.items || []);
        setLoading(false);
      });
  };

  useEffect(load, []);

  const changeRole = async (id, role) => {
    await fetch(`/api/team/members/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    load();
  };

  const removeMember = async (id) => {
    await fetch(`/api/team/members/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden mt-4">
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-700 tracking-tight">Team members</h2>
          {canManage && (
            <button
              onClick={() => setInviteOpen(true)}
              className="flex items-center gap-2 h-11 px-5 rounded-full text-sm font-medium text-white shadow-xs"
              style={{ background: "linear-gradient(to right, #7f64f5, #ae79f8)" }}
            >
              <UserPlus size={16} /> Invite member
            </button>
          )}
        </div>

        {loading ? (
          <p className="py-10 text-center text-sm text-gray-400">Loading members...</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-100">
            <div className="grid grid-cols-[2fr_1fr_1fr_auto] bg-gray-50/70 px-5 py-3 text-sm font-medium text-gray-500">
              <span>Member</span>
              <span>Role</span>
              <span>Status</span>
              <span className="text-right">Actions</span>
            </div>
            {members.map((m, idx) => (
              <div
                key={m.id}
                className={`grid grid-cols-[2fr_1fr_1fr_auto] items-center px-5 py-4 ${
                  idx !== members.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  {m.user?.avatarUrl ? (
                    <img
                      src={m.user.avatarUrl}
                      alt={m.user.name || "Member"}
                      className="w-9 h-9 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">
                      {(m.user?.name || m.invitedEmail || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-gray-700">
                        {m.user?.name || m.invitedEmail}
                      </p>
                      {m.user?.linkedinUrl && (
                        <a
                          href={m.user.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#6367FF] hover:opacity-80"
                          title="View on LinkedIn"
                        >
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{m.user?.email || m.invitedEmail}</p>
                  </div>
                </div>

                <div>
                  {canManage && m.role !== "owner" ? (
                    <select
                      value={m.role}
                      onChange={(e) => changeRole(m.id, e.target.value)}
                      className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 outline-none"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    <Badge color={ROLE_BADGE[m.role] || "gray"}>{m.role}</Badge>
                  )}
                </div>

                <Badge color={m.status === "active" ? "green" : "amber"}>{m.status}</Badge>

                <div className="flex justify-end">
                  {canManage && m.role !== "owner" && (
                    <button
                      onClick={() => removeMember(m.id)}
                      className="text-xs font-medium text-red-400 hover:text-red-600"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <InviteMemberModal open={inviteOpen} onClose={() => setInviteOpen(false)} onInvited={load} />
    </div>
  );
}
