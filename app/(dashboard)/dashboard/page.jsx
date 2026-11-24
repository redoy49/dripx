import { Suspense } from "react";
import DashboardLoading from "./loading";
import DashboardClient from "./DashboardClient";

export const metadata = {
  title: "Dashboard Overview — DripX",
  description: "Real-time outreach velocity, pipeline status, and health metrics.",
};

/**
 * Server Component Shell for Dashboard Overview.
 * Renders static layout and skeleton boundaries immediately,
 * streaming client-interactive components seamlessly without waterfalls.
 */
export default function DashboardOverviewPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardClient />
    </Suspense>
  );
}
