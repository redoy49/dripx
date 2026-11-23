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
    <div className="bg-white rounded-2xl shadow-2xs border border-gray-200/90 overflow-hidden">
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Team Members</h2>
            <p className="text-xs text-gray-400 mt-0.5">Manage team access, permissions, and roles</p>
          </div>
          {canManage && (
            <button
              onClick={() => setInviteOpen(true)}
              className="flex items-center gap-2 rounded-full bg-indigo-400 hover:bg-indigo-500 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition active:scale-95 cursor-pointer"
            >
              <UserPlus size={15} /> <span>Invite Member</span>
            </button>
          )}
        </div>

        {loading ? (
          <p className="py-10 text-center text-xs font-medium text-gray-400">Loading members...</p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200/90 shadow-2xs">
            <div className="grid grid-cols-[2fr_1fr_1fr_auto] bg-gray-50/70 px-5 py-3 text-xs font-bold text-gray-500">
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
                      className="w-9 h-9 rounded-full object-cover shrink-0 border border-gray-200/90 shadow-2xs"
                    />
                  ) : (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-500">
                      {(m.user?.name || m.invitedEmail || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-gray-800">
                        {m.user?.name || m.invitedEmail}
                      </p>
                      {m.user?.linkedinUrl && (
                        <a
                          href={m.user.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sky-500 hover:opacity-80"
                          title="View on LinkedIn"
                        >
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400">{m.user?.email || m.invitedEmail}</p>
                  </div>
                </div>

                <div>
                  {canManage && m.role !== "owner" ? (
                    <select
                      value={m.role}
                      onChange={(e) => changeRole(m.id, e.target.value)}
                      className="rounded-full border border-gray-200/90 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-2xs outline-none transition focus:border-indigo-400 cursor-pointer"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    <Badge color={ROLE_BADGE[m.role] || "gray"}>{m.role}</Badge>
                  )}
                </div>

                <div>
                  <Badge color={m.status === "active" ? "green" : "amber"}>{m.status}</Badge>
                </div>

                <div className="flex justify-end">
                  {canManage && m.role !== "owner" && (
                    <button
                      onClick={() => removeMember(m.id)}
                      className="rounded-full border border-rose-200/80 bg-white px-3 py-1 text-xs font-semibold text-rose-500 hover:bg-rose-50 shadow-2xs active:scale-95 transition cursor-pointer"
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
