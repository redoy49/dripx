"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLoading from "./loading";
import { getCached, setCached } from "@/app/lib/swrCache";
import DashboardHeader from "./_components/DashboardHeader";
import StatisticsSection from "./_components/StatisticsSection";
import RecentCampaignsCard from "./_components/RecentCampaignsCard";
import TeamVelocitySection from "./_components/TeamVelocitySection";

export default function DashboardClient({ initialSummary = null }) {
  const router = useRouter();
  const [creatingCampaign, setCreatingCampaign] = useState(false);
  const [range, setRange] = useState("7d");
  const [summary, setSummary] = useState(() => {
    return initialSummary || getCached("/api/dashboard/summary?range=7d");
  });
  const [loading, setLoading] = useState(() => {
    return !initialSummary && !getCached("/api/dashboard/summary?range=7d");
  });
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [teamMembers, setTeamMembers] = useState(() => {
    const seed = initialSummary || getCached("/api/dashboard/summary?range=7d");
    return seed?.teamMembers || [];
  });
  const [campaignToggles, setCampaignToggles] = useState({});
  const skipInitialFetchRef = useRef(Boolean(initialSummary));

  useEffect(() => {
    if (initialSummary) {
      setCached("/api/dashboard/summary?range=7d", initialSummary);
    }
  }, [initialSummary]);

  const loadSummary = useCallback(
    async (selectedRange = range) => {
      try {
        const apiRange =
          selectedRange === "yesterday" || selectedRange === "pick" ? "7d" : selectedRange;
        const url = `/api/dashboard/summary?range=${apiRange}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setCached(url, data);
          setSummary(data);
          if (data.teamMembers && data.teamMembers.length > 0) {
            setTeamMembers(data.teamMembers);
          }
        }
      } catch (err) {
        console.error("Failed to load dashboard summary:", err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [range],
  );

  useEffect(() => {
    if (skipInitialFetchRef.current && range === "7d") {
      skipInitialFetchRef.current = false;
      return;
    }

    let ignore = false;
    const apiRange = range === "yesterday" || range === "pick" ? "7d" : range;
    const url = `/api/dashboard/summary?range=${apiRange}`;

    fetch(url)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!ignore && data) {
          setCached(url, data);
          setSummary(data);
          if (data.teamMembers && data.teamMembers.length > 0) {
            setTeamMembers(data.teamMembers);
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error("Summary load failed:", err);
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [range]);

  const handleCreateCampaign = async () => {
    if (creatingCampaign) return;
    setCreatingCampaign(true);
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Untitled Campaign" }),
      });
      const data = await res.json();
      if (res.ok && data?.id) {
        router.push(`/dashboard/new-campaign?id=${data.id}`);
        return;
      }
    } catch (err) {
      console.error("Failed to create campaign:", err);
    } finally {
      setCreatingCampaign(false);
    }
    router.push("/dashboard/new-campaign");
  };

  const handleRangeChange = (newRange) => {
    setRange(newRange);
    setRefreshing(true);
    loadSummary(newRange);
  };

  const handleToggleCampaign = (id, currentStatus) => {
    setCampaignToggles((prev) => ({
      ...prev,
      [id]: prev[id] !== undefined ? !prev[id] : currentStatus !== "active",
    }));
  };

  const showWithdrawToast = () => {
    setToast("Pending connection invitations successfully withdrawn.");
    setTimeout(() => setToast(null), 3000);
  };

  const pipeline = summary?.pipeline || {};
  const outreach = summary?.outreach || {};
  const conversations = summary?.conversations || {};
  const topCampaigns = summary?.topCampaigns || [];
  const recentActivity = summary?.recentActivity || [];
  const alerts = summary?.alerts || [];
  const pendingInvitations = pipeline.pendingInvitesCount || pipeline.unassignedCount || 0;
  const unreadMessagesCount = conversations.unreadCount || 0;

  if (loading && !summary) {
    return <DashboardLoading />;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFC] p-4 sm:p-6 lg:p-7 space-y-6 w-full max-w-full text-gray-800">
      <DashboardHeader
        greetingName={summary?.greetingName}
        unreadMessagesCount={unreadMessagesCount}
        creatingCampaign={creatingCampaign}
        refreshing={refreshing}
        alerts={alerts}
        toast={toast}
        onCreateCampaign={handleCreateCampaign}
        onRefresh={() => {
          setRefreshing(true);
          loadSummary();
        }}
      />

      <StatisticsSection
        outreach={outreach}
        pipeline={pipeline}
        conversations={conversations}
        recentActivity={recentActivity}
        onWithdrawToast={showWithdrawToast}
      />

      <RecentCampaignsCard
        topCampaigns={topCampaigns}
        campaignToggles={campaignToggles}
        creatingCampaign={creatingCampaign}
        onCreateCampaign={handleCreateCampaign}
        onToggleCampaign={handleToggleCampaign}
      />

      <TeamVelocitySection
        range={range}
        teamMembers={teamMembers}
        selectedMember={selectedMember}
        onSelectMember={setSelectedMember}
        onRangeChange={handleRangeChange}
        velocityChart={summary?.velocityChart}
        unreadMessagesCount={unreadMessagesCount}
        topCampaignsCount={topCampaigns.length}
        pipeline={pipeline}
        pendingInvitations={pendingInvitations}
      />
    </div>
  );
}
