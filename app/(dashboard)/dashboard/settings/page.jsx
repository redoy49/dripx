import { Suspense } from "react";
import SettingsLoading from "./loading";
import SettingsClient from "./SettingsClient";
import { getLayoutAuthData } from "@/app/lib/serverSession";
import { getWorkspaceLimits, DEFAULT_DAILY_LIMITS } from "@/app/lib/limits";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Settings — DripX",
  description: "Configure daily limits, email accounts, integrations, and AI providers.",
};

const EDITABLE_FIELDS = Object.keys(DEFAULT_DAILY_LIMITS);

async function SettingsStream() {
  const auth = await getLayoutAuthData();
  let initialLimits = null;

  if (auth?.session) {
    try {
      const doc = await getWorkspaceLimits(auth.session.workspaceId);
      if (doc) {
        initialLimits = {};
        for (const key of EDITABLE_FIELDS) {
          initialLimits[key] = doc[key];
        }
      }
    } catch (err) {
      if (err?.digest === "DYNAMIC_SERVER_USAGE") throw err;
      console.error("Server settings stream failed, falling back to client fetch:", err);
    }
  }

  return <SettingsClient initialLimits={initialLimits} />;
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsLoading />}>
      <SettingsStream />
    </Suspense>
  );
}
