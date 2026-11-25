import crypto from "node:crypto";
import { ObjectId } from "mongodb";
import { createGateway, gateway } from "@ai-sdk/gateway";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { dbConnect } from "@/app/lib/mongoDb";
import { decryptCredentials } from "@/app/lib/crypto";
import { getProviderPreset } from "./providers.js";
import { PLATFORM_FALLBACK_MODELS } from "./models.js";

export async function getWorkspaceProviderConfigs(workspaceId) {
  const col = await dbConnect("ai_provider_configs");
  const doc = await col.findOne({ workspaceId: new ObjectId(workspaceId) });
  if (!doc?.providers) return {};

  const resolved = {};
  for (const [providerId, entry] of Object.entries(doc.providers)) {
    const encryptedPayload = entry?.credentials || (entry?.encryptedData ? entry : null);
    const decrypted = decryptCredentials(encryptedPayload);
    const apiKey = typeof decrypted === "string" ? decrypted.trim() : decrypted?.apiKey?.trim();
    if (!apiKey) continue;

    const preset = getProviderPreset(providerId);
    resolved[providerId] = {
      providerId,
      label: entry?.customName || preset?.label || providerId,
      apiKey,
      baseUrl: (typeof decrypted === "object" && decrypted?.baseUrl) || entry?.baseUrl || preset?.defaultBaseUrl || "",
      syncedModels: Array.isArray(entry?.syncedModels) ? entry.syncedModels : [],
    };
  }
  return resolved;
}

/**
 * Returns ONLY models unlocked on the workspace's active provider key(s),
 * or platform AI Gateway models when a server-wide Gateway key/OIDC token is configured.
 */
export async function getWorkspaceAvailableModels(workspaceId) {
  const configs = await getWorkspaceProviderConfigs(workspaceId);
  const models = [];

  for (const cfg of Object.values(configs)) {
    for (const m of cfg.syncedModels) {
      models.push({ ...m, sourceProviderId: cfg.providerId, sourceLabel: cfg.label });
    }
  }

  if (models.length > 0) return models;

  if (process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN) {
    return PLATFORM_FALLBACK_MODELS.map((m) => ({ ...m, sourceLabel: "Platform AI Gateway" }));
  }

  return [];
}

function instantiateAdapter(providerId, modelId, apiKey, baseUrl) {
  const preset = getProviderPreset(providerId);
  const kind = preset?.kind || "openai-compatible";

  switch (kind) {
    case "gateway":
      return (apiKey ? createGateway({ apiKey }) : gateway)(modelId);
    case "anthropic":
      return createAnthropic({ apiKey })(modelId);
    case "anthropic-compatible":
      return createAnthropic({ baseURL: baseUrl, apiKey })(modelId);
    case "deepseek":
      return createDeepSeek({ apiKey })(modelId);
    case "google":
      return createGoogleGenerativeAI({ apiKey })(modelId);
    case "openai":
      return createOpenAI({ apiKey }).chat(modelId);
    case "openai-compatible":
    default:
      return createOpenAI({ baseURL: baseUrl, apiKey }).chat(modelId);
  }
}

export function formatAgentStreamError(err) {
  const raw =
    err?.data?.error?.message ||
    err?.responseBody ||
    err?.message ||
    "Failed to get a response from the selected AI provider.";

  return String(raw)
    .replace(/\b(sk-[A-Za-z0-9_-]{6,}|rv_[A-Za-z0-9_-]{6,}|vck_[A-Za-z0-9_-]{6,}|AIza[A-Za-z0-9_-]{6,})\b/g, "[REDACTED_KEY]")
    .replace(/Bearer\s+\S+/gi, "Bearer [REDACTED]")
    .slice(0, 320);
}

export async function resolveAgentModel({
  workspaceId,
  modelId,
  sourceProviderId,
  reasoningEffort = "high",
}) {
  const configs = await getWorkspaceProviderConfigs(workspaceId);
  const available = await getWorkspaceAvailableModels(workspaceId);

  if (available.length === 0) {
    const err = new Error("No active AI models found. Add and verify an API key in Settings > AI Providers.");
    err.code = "MISSING_AI_CREDENTIALS";
    throw err;
  }

  const chosen =
    available.find((m) => m.id === modelId && (!sourceProviderId || m.sourceProviderId === sourceProviderId)) ||
    available.find((m) => m.id === modelId) ||
    available[0];

  const cfg = configs[chosen.sourceProviderId];
  const safetyId = crypto.createHash("sha256").update(String(workspaceId)).digest("hex").slice(0, 32);

  if (cfg) {
    const isGateway = getProviderPreset(cfg.providerId)?.kind === "gateway";
    return {
      model: instantiateAdapter(cfg.providerId, chosen.id, cfg.apiKey, cfg.baseUrl),
      modelMeta: chosen,
      routeMode: isGateway ? "gateway-byok" : `byok:${cfg.providerId}`,
      reasoning: isGateway && chosen.supportsReasoning ? reasoningEffort : undefined,
      providerOptions: isGateway
        ? { gateway: { caching: "auto", safetyIdentifier: safetyId, tags: ["feature:dripx-agent"] } }
        : undefined,
    };
  }

  return {
    model: gateway(chosen.id),
    modelMeta: chosen,
    routeMode: "gateway-platform",
    reasoning: chosen.supportsReasoning ? reasoningEffort : undefined,
    providerOptions: {
      gateway: { caching: "auto", safetyIdentifier: safetyId, tags: ["feature:dripx-agent"] },
    },
  };
}
