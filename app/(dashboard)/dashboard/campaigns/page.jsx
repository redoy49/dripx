import { Suspense } from "react";
import CampaignsLoading from "./loading";
import CampaignsClient from "./CampaignsClient";
import { getLayoutAuthData } from "@/app/lib/serverSession";
import { getWorkspaceCampaigns } from "@/app/lib/campaignsLoader";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Campaigns — DripX",
  description: "Manage outreach campaigns, multi-channel sequences, and pipeline velocity.",
};

async function CampaignsStream() {
  const auth = await getLayoutAuthData();
  let initialCampaigns = null;

  if (auth?.session) {
    try {
      initialCampaigns = await getWorkspaceCampaigns(auth.session.workspaceId);
    } catch (err) {
      if (err?.digest === "DYNAMIC_SERVER_USAGE") throw err;
      console.error("Server campaigns stream failed, falling back to client fetch:", err);
    }
  }

  return <CampaignsClient initialCampaigns={initialCampaigns} />;
}

export default function CampaignsPage() {
  return (
    <Suspense fallback={<CampaignsLoading />}>
      <CampaignsStream />
    </Suspense>
  );
}
