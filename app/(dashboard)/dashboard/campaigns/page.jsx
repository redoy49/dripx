import { Suspense } from "react";
import CampaignsLoading from "./loading";
import CampaignsClient from "./CampaignsClient";

export const metadata = {
  title: "Campaigns — DripX",
  description: "Manage outreach campaigns, multi-channel sequences, and pipeline velocity.",
};

/**
 * Server Component Shell for Campaigns.
 * Provides instant layout rendering and streaming Suspense boundary.
 */
export default function CampaignsPage() {
  return (
    <Suspense fallback={<CampaignsLoading />}>
      <CampaignsClient />
    </Suspense>
  );
}
