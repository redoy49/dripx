"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";
import BellIcon from "@/app/components/ui/BellIcon";
import { getCached, setCached } from "@/app/lib/swrCache";
import TeamsLoading, { MembersTableSkeleton } from "./loading";
import TeamProfileOverview from "./_components/TeamProfileOverview";
import TeamActivityChart from "./_components/TeamActivityChart";

const MembersTab = dynamic(() => import("@/app/(dashboard)/dashboard/teams/MembersTab"), {
  ssr: false,
  loading: () => <MembersTableSkeleton />,
});

const EditProfileModal = dynamic(
  () => import("@/app/(dashboard)/dashboard/teams/EditProfileModal"),
  { ssr: false },
);

const FALLBACK_STATS = [
  { title: "Pricing plan", value: "Trial", badge: "Active" },
  {
    title: "Email finder",
    value: "XL - Monthly",
    badge: "Active",
    right: "Used: 0/1200",
    link: "Upgrade",
  },
  { title: "Role", value: "Owner", icon: true, dropdown: true },
  { title: "Profile rating", value: "Expert" },
];

const FALLBACK_OVERVIEW = [
  { label: "Unread messages", value: "0" },
  { label: "Active campaigns", value: "1" },
  { label: "Connections", value: "3,224" },
  { label: "Pending invites\nreceived", value: "6" },
  { label: "Profile views\nsince last week", value: "0" },
  { label: "Weekly search\nappearances", value: "23" },
];

export default function TeamsClient({ initialProfile = null, initialRole = "member" }) {
  const router = useRouter();
  const [tab, setTab] = useState("profile");
  const [profile, setProfile] = useState(
    () => initialProfile || getCached("/api/team/profile?range=7"),
  );
  const [activeRange, setActiveRange] = useState("7");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const skipInitialFetchRef = useRef(Boolean(initialProfile));

  useEffect(() => {
    if (initialProfile) {
      setCached("/api/team/profile?range=7", initialProfile);
    }
  }, [initialProfile]);

  const loadProfile = useCallback(async (range = "7") => {
    try {
      const url = `/api/team/profile?range=${range}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setCached(url, data);
        setProfile(data);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (skipInitialFetchRef.current) {
      skipInitialFetchRef.current = false;
      return;
    }
    if (!profile) {
      queueMicrotask(() => {
        loadProfile("7");
      });
    }
  }, [loadProfile, profile]);

  const handleRangeChange = (rangeKey) => {
    setActiveRange(rangeKey);
    loadProfile(rangeKey);
  };

  const handleExportActivity = () => {
    if (!profile?.activity?.length) return;
    const rows = [
      [
        "Date",
        "Connect Requests",
        "Direct Messages",
        "InMails",
        "Profile Visits",
        "Post Likes",
        "Follows",
        "Emails",
      ],
    ];
    profile.activity.forEach((act) => {
      rows.push([
        act.dateLabel,
        act.heights[0],
        act.heights[1],
        act.heights[2],
        act.heights[3],
        act.heights[4],
        act.heights[5],
        act.heights[6],
      ]);
    });
    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `dripx_linkedin_activity_${activeRange}d.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!profile) {
    return <TeamsLoading />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-transparent p-4 sm:p-6 space-y-6">
      <div className="bg-white rounded-2xl shadow-2xs border border-gray-200/90 p-4 sm:p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Team & Identity</h1>
          <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-500">
            Workspace
          </span>
        </div>

        <button
          title="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-full border border-gray-200/90 bg-white text-gray-500 shadow-2xs transition hover:bg-gray-50 active:scale-95 cursor-pointer"
        >
          <BellIcon />
        </button>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="inline-flex p-1 rounded-full border border-gray-200/90 bg-white shadow-2xs gap-1">
          {[
            { key: "profile", label: "My Profile" },
            { key: "members", label: "Members" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-full px-5 py-2 text-xs font-bold transition cursor-pointer ${
                tab === t.key
                  ? "bg-indigo-400 text-white shadow-xs"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "members" && <MembersTab currentRole={initialRole} />}

      {tab === "profile" && (
        <>
          <TeamProfileOverview
            profile={profile}
            statsData={profile?.stats || FALLBACK_STATS}
            overviewData={profile?.overview || FALLBACK_OVERVIEW}
            onEditOpen={() => setEditModalOpen(true)}
          />
          <TeamActivityChart
            activeRange={activeRange}
            activityData={profile?.activity || []}
            onRangeChange={handleRangeChange}
            onExportCsv={handleExportActivity}
          />
        </>
      )}

      <button
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full flex items-center justify-center bg-indigo-400 hover:bg-indigo-500 shadow-md text-white transition active:scale-95 cursor-pointer"
        title="Team Chat"
      >
        <Mail className="w-5 h-5" />
        <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-rose-400 text-[10px] font-bold flex items-center justify-center text-white">
          1
        </span>
      </button>

      {editModalOpen && (
        <EditProfileModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          user={profile?.user}
          onUpdated={() => {
            loadProfile(activeRange);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
