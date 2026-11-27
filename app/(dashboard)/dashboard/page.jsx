import { Suspense } from "react";
import DashboardLoading from "./loading";
import DashboardClient from "./DashboardClient";
import { getLayoutAuthData } from "@/app/lib/serverSession";
import { getDashboardSummary } from "@/app/lib/dashboardSummary";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard Overview — DripX",
  description: "Real-time outreach velocity, pipeline status, and health metrics.",
};

async function DashboardSummaryStream() {
  const auth = await getLayoutAuthData();
  let initialSummary = null;

  if (auth?.session) {
    try {
      initialSummary = await getDashboardSummary({
        userId: auth.session.userId,
        workspaceId: auth.session.workspaceId,
        range: "7d",
      });
    } catch (err) {
      if (err?.digest === "DYNAMIC_SERVER_USAGE") throw err;
      console.error("Server summary stream failed, falling back to client fetch:", err);
    }
  }

  return <DashboardClient initialSummary={initialSummary} />;
}

/**
 * Server Component Shell for Dashboard Overview.
 * Streams `<DashboardLoading />` immediately while computing aggregated workspace telemetry on the server,
 * eliminating the post-hydration client fetch waterfall on first sign-in.
 */
export default function DashboardOverviewPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardSummaryStream />
    </Suspense>
  );
}
