import { Suspense } from "react";
import LeadsLoading from "./loading";
import LeadsClient from "./LeadsClient";
import { getLayoutAuthData } from "@/app/lib/serverSession";
import { getWorkspaceLeads } from "@/app/lib/leadsLoader";
import { getWorkspaceCampaigns } from "@/app/lib/campaignsLoader";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Leads & Prospects — DripX",
  description: "Search, segment, tag, and enroll prospects across campaigns.",
};

async function LeadsStream() {
  const auth = await getLayoutAuthData();
  let initialLeadsData = null;
  let initialCampaigns = null;

  if (auth?.session) {
    try {
      [initialLeadsData, initialCampaigns] = await Promise.all([
        getWorkspaceLeads({
          workspaceId: auth.session.workspaceId,
          page: 1,
          limit: 25,
        }),
        getWorkspaceCampaigns(auth.session.workspaceId),
      ]);
    } catch (err) {
      if (err?.digest === "DYNAMIC_SERVER_USAGE") throw err;
      console.error("Server leads stream failed, falling back to client fetch:", err);
    }
  }

  return (
    <LeadsClient
      initialLeadsData={initialLeadsData}
      initialCampaigns={initialCampaigns}
    />
  );
}

export default function LeadsPage() {
  return (
    <Suspense fallback={<LeadsLoading />}>
      <LeadsStream />
    </Suspense>
  );
}
