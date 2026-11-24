import { Suspense } from "react";
import InboxLoading from "./loading";
import InboxClient from "./InboxClient";

export const metadata = {
  title: "Unified Inbox — DripX",
  description: "Unified cross-channel conversation inbox for Email and LinkedIn.",
};

/**
 * Server Component Shell for Unified Inbox.
 * Enables instant shell streaming with zero layout shift.
 */
export default function InboxPage() {
  return (
    <Suspense fallback={<InboxLoading />}>
      <InboxClient />
    </Suspense>
  );
}
