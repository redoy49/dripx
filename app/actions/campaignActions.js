"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

/**
 * Server Action: Toggles campaign status between active and paused.
 * Employs revalidatePath for instant cache consistency.
 */
export async function toggleCampaignStatusAction(campaignId, currentStatus) {
  try {
    const isCurrentlyActive = currentStatus === "active";
    const reqHeaders = await headers();
    const cookie = reqHeaders.get("cookie") || "";
    const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (isCurrentlyActive) {
      await fetch(`${origin}/api/campaigns/${campaignId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          cookie,
        },
        body: JSON.stringify({ status: "paused" }),
      });
    } else {
      await fetch(`${origin}/api/campaigns/${campaignId}/activate`, {
        method: "POST",
        headers: { cookie },
      });
    }

    revalidatePath("/dashboard/campaigns");
    return { success: true, nextStatus: isCurrentlyActive ? "paused" : "active" };
  } catch (err) {
    console.error("toggleCampaignStatusAction error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Server Action: Deletes a campaign and purges related campaign caches.
 */
export async function deleteCampaignAction(campaignId) {
  try {
    const reqHeaders = await headers();
    const cookie = reqHeaders.get("cookie") || "";
    const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const res = await fetch(`${origin}/api/campaigns/${campaignId}`, {
      method: "DELETE",
      headers: { cookie },
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { success: false, error: data.message || "Failed to delete" };
    }

    revalidatePath("/dashboard/campaigns");
    return { success: true };
  } catch (err) {
    console.error("deleteCampaignAction error:", err);
    return { success: false, error: err.message };
  }
}
