import { redirect } from "next/navigation";
import { getLayoutAuthData } from "@/app/lib/serverSession";
import DashboardShell from "./layout/DashboardShell";

export default async function DashboardLayout({ children }) {
  const auth = await getLayoutAuthData();

  if (!auth) {
    redirect("/login");
  }

  return (
    <DashboardShell
      initialUser={auth.user}
      initialUnreadCount={auth.unreadCount}
      workspaceId={auth.workspace?.id || null}
    >
      {children}
    </DashboardShell>
  );
}
