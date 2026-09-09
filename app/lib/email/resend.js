// Thin Resend wrapper. If RESEND_API_KEY isn't set, every call logs a warning and returns
// { success: false, skipped: true } instead of throwing, so the app runs fine in dev without
// an email provider configured — activate real sending by adding the key to .env.local.
export async function sendEmail({ to, subject, body, from }) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn(
      `[resend] RESEND_API_KEY not set — skipping real send. Would have emailed ${to}: "${subject}"`,
    );
    return { success: false, skipped: true };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: from || "DripX <onboarding@resend.dev>",
        to: [to],
        subject,
        text: body,
      }),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error("[resend] send failed:", res.status, errorBody);
      return { success: false, error: `Resend API error ${res.status}` };
    }

    const data = await res.json();
    return { success: true, providerMessageId: data.id };
  } catch (error) {
    console.error("[resend] send failed:", error);
    return { success: false, error: error.message };
  }
}
