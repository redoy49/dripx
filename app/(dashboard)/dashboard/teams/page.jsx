import { Suspense } from "react";
import TeamsLoading from "./loading";
import TeamsClient from "./TeamsClient";
import { getLayoutAuthData } from "@/app/lib/serverSession";
import { getTeamProfileData } from "@/app/lib/teamProfile";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Team & Identity — DripX",
  description: "Manage workspace team members, LinkedIn identity, and outreach velocity.",
};

async function TeamsStream() {
  const auth = await getLayoutAuthData();
  let initialProfile = null;

  if (auth?.session) {
    try {
      initialProfile = await getTeamProfileData({
        userId: auth.session.userId,
        workspaceId: auth.session.workspaceId,
        range: "7",
      });
    } catch (err) {
      if (err?.digest === "DYNAMIC_SERVER_USAGE") throw err;
      console.error("Server team profile stream failed, falling back to client fetch:", err);
    }
  }

  return (
    <TeamsClient
      initialProfile={initialProfile}
      initialRole={auth?.role || "member"}
    />
  );
}

export default function TeamsPage() {
  return (
    <Suspense fallback={<TeamsLoading />}>
      <TeamsStream />
    </Suspense>
  );
}
