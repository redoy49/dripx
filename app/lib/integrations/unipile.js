import crypto from "crypto";

// Thin wrapper around the Unipile REST API (developer.unipile.com). Needs UNIPILE_DSN
// and UNIPILE_API_KEY from the Unipile dashboard.

function baseUrl() {
  const dsn = process.env.UNIPILE_DSN;
  if (!dsn) throw new Error("UNIPILE_DSN is missing in .env.local");
  return dsn.replace(/\/+$/, "");
}

function apiKey() {
  const key = process.env.UNIPILE_API_KEY;
  if (!key) throw new Error("UNIPILE_API_KEY is missing in .env.local");
  return key;
}

async function request(path, { method = "GET", query, json, form } = {}) {
  const url = new URL(`${baseUrl()}/api/v1${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
    }
  }

  const headers = { "X-API-KEY": apiKey(), accept: "application/json" };
  let body;

  if (form) {
    body = new FormData();
    for (const [k, v] of Object.entries(form)) {
      if (v === undefined || v === null) continue;
      body.append(k, typeof v === "boolean" ? String(v) : v);
    }
  } else if (json) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(json);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  let res;
  try {
    res = await fetch(url, { method, headers, body, signal: controller.signal });
  } catch (error) {
    if (error.name === "AbortError") throw new Error(`Unipile request timed out: ${path}`);
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const message = data?.title || data?.detail || data?.message || `Unipile API error ${res.status}`;
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

// Full profile URL or bare slug -> just the slug (the shared key for matching a lead's
// LinkedIn identity across the app).
export function slugFromLinkedinUrl(url) {
  const trimmed = (url || "").trim();
  if (!trimmed) return null;

  const match = trimmed.match(/linkedin\.com\/in\/([^/?#]+)/i);
  return (match ? match[1] : trimmed.replace(/\/+$/, "").split("/").pop()).toLowerCase();
}

export function isUnipileConfigured() {
  return !!(process.env.UNIPILE_DSN && process.env.UNIPILE_API_KEY);
}

// Deterministic from JWT_SECRET (mirrors the x-cron-secret pattern) — no separate
// secret to generate/store/rotate. Set as a custom header on our /webhooks subscriptions.
export function unipileWebhookSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is missing in .env.local");
  return crypto.createHmac("sha256", secret).update("unipile-webhook").digest("hex").slice(0, 32);
}

// --- Account connection (hosted auth wizard) --------------------------------------

export async function createHostedAuthLink({ successRedirectUrl, failureRedirectUrl, notifyUrl, name }) {
  return request("/hosted/accounts/link", {
    method: "POST",
    json: {
      type: "create",
      providers: ["LINKEDIN"],
      api_url: baseUrl(),
      expiresOn: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      success_redirect_url: successRedirectUrl,
      failure_redirect_url: failureRedirectUrl,
      notify_url: notifyUrl,
      name,
    },
  });
}

export async function deleteAccount(accountId) {
  return request(`/accounts/${accountId}`, { method: "DELETE" });
}

// --- Webhooks (registered once per environment, idempotently) ---------------------

export async function listWebhooks() {
  const data = await request("/webhooks");
  return data?.items || [];
}

export async function createWebhook({ source, requestUrl, events, name }) {
  return request("/webhooks", {
    method: "POST",
    json: {
      source,
      request_url: requestUrl,
      events,
      name,
      format: "json",
      headers: [{ key: "x-unipile-secret", value: unipileWebhookSecret() }],
    },
  });
}

export async function deleteWebhook(id) {
  return request(`/webhooks/${id}`, { method: "DELETE" });
}

// Creates missing webhooks and recreates any whose URL has drifted (e.g. a new ngrok
// tunnel address — Unipile has no "update webhook" endpoint). Safe to call repeatedly.
export async function ensureWebhooksRegistered(baseAppUrl) {
  const existing = await listWebhooks();
  const existingByName = new Map(existing.map((w) => [w.name, w]));

  const wanted = [
    { name: "dripx-account-status", source: "account_status", events: ["creation_success", "creation_fail", "reconnected", "error", "credentials", "deleted"], requestUrl: `${baseAppUrl}/api/webhooks/unipile/account-status` },
    { name: "dripx-messaging", source: "messaging", events: ["message_received"], requestUrl: `${baseAppUrl}/api/webhooks/unipile/messaging` },
    { name: "dripx-users", source: "users", events: ["new_relation"], requestUrl: `${baseAppUrl}/api/webhooks/unipile/users` },
  ];

  for (const w of wanted) {
    const current = existingByName.get(w.name);
    if (current && current.request_url === w.requestUrl) continue;

    if (current) {
      const id = current.id || current.webhook_id;
      if (id) await deleteWebhook(id).catch(() => {});
    }
    await createWebhook(w);
  }
}

// --- LinkedIn actions ---------------------------------------------------------------

export async function getProfile({ accountId, identifier, notify = false }) {
  return request(`/users/${encodeURIComponent(identifier)}`, {
    query: { account_id: accountId, notify: notify ? "true" : undefined },
  });
}

export async function sendInvitation({ accountId, providerId, message }) {
  return request("/users/invite", {
    method: "POST",
    json: { account_id: accountId, provider_id: providerId, message: message || undefined },
  });
}

export async function startChat({ accountId, attendeeProviderId, text, subject, inmail }) {
  return request("/chats", {
    method: "POST",
    form: {
      account_id: accountId,
      "attendees_ids[]": attendeeProviderId,
      text,
      subject: subject || undefined,
      ...(inmail ? { "linkedin[inmail]": true } : {}),
    },
  });
}

export async function sendMessageInChat({ accountId, chatId, text }) {
  return request(`/chats/${chatId}/messages`, {
    method: "POST",
    form: { account_id: accountId, text },
  });
}

export async function reactToPost({ accountId, postId }) {
  return request("/posts/reaction", {
    method: "POST",
    json: { account_id: accountId, post_id: postId, reaction_type: "like" },
  });
}
