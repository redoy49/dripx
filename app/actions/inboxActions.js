"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

/**
 * Server Action: Dispatches an outbound reply (Email RFC 2822 or LinkedIn)
 * and invalidates the inbox thread cache.
 */
export async function sendReplyAction(conversationId, body) {
  try {
    const reqHeaders = await headers();
    const cookie = reqHeaders.get("cookie") || "";
    const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const res = await fetch(`${origin}/api/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie,
      },
      body: JSON.stringify({ body }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: data.message || "Failed to send message" };
    }

    revalidatePath("/dashboard/inbox");
    return { success: true, message: data };
  } catch (err) {
    console.error("sendReplyAction error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Server Action: Updates conversation status (open, important, archived) or markRead.
 */
export async function updateConversationStatusAction(conversationId, updateData) {
  try {
    const reqHeaders = await headers();
    const cookie = reqHeaders.get("cookie") || "";
    const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const res = await fetch(`${origin}/api/conversations/${conversationId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        cookie,
      },
      body: JSON.stringify(updateData),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { success: false, error: data.message || "Failed to update" };
    }

    revalidatePath("/dashboard/inbox");
    return { success: true };
  } catch (err) {
    console.error("updateConversationStatusAction error:", err);
    return { success: false, error: err.message };
  }
}
