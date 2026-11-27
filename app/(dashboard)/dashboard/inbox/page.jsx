import { Suspense } from "react";
import InboxLoading from "./loading";
import InboxClient from "./InboxClient";
import { getLayoutAuthData } from "@/app/lib/serverSession";
import { getConversationsList } from "@/app/lib/conversationsLoader";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Unified Inbox — DripX",
  description: "Unified cross-channel conversation inbox for Email and LinkedIn.",
};

async function InboxStream() {
  const auth = await getLayoutAuthData();
  let initialConversations = null;

  if (auth?.session) {
    try {
      initialConversations = await getConversationsList({
        workspaceId: auth.session.workspaceId,
        filter: "all",
        channel: "all",
      });
    } catch (err) {
      if (err?.digest === "DYNAMIC_SERVER_USAGE") throw err;
      console.error("Server inbox stream failed, falling back to client fetch:", err);
    }
  }

  return <InboxClient initialConversations={initialConversations} />;
}

export default function InboxPage() {
  return (
    <Suspense fallback={<InboxLoading />}>
      <InboxStream />
    </Suspense>
  );
}
