"use client";

import { useEffect, useState } from "react";
import { UserPlus } from "lucide-react";
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
              className="flex items-center gap-2 h-11 px-5 rounded-xl text-sm font-medium text-white shadow-xs"
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
                <div>
                  <p className="text-sm font-semibold text-gray-700">
                    {m.user?.name || m.invitedEmail}
                  </p>
                  <p className="text-xs text-gray-400">{m.user?.email || m.invitedEmail}</p>
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
