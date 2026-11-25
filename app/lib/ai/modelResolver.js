import crypto from "node:crypto";
import { ObjectId } from "mongodb";
import { createGateway, gateway } from "@ai-sdk/gateway";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { dbConnect } from "@/app/lib/mongoDb";
import { decryptCredentials } from "@/app/lib/crypto";
import { getModelConfig } from "./models";

const BYOK_GATEWAY_SLUGS = {
  anthropic: "anthropic",
  openai: "openai",
  deepseek: "deepseek",
  google: "google",
};

const ENV_PROVIDER_KEYS = {
  anthropic: () => process.env.ANTHROPIC_API_KEY,
  openai: () => process.env.OPENAI_API_KEY,
  deepseek: () => process.env.DEEPSEEK_API_KEY,
  google: () => process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY,
};

/**
 * Loads decrypted BYOK API keys saved for a workspace in `ai_provider_configs`.
 * Keys stay strictly server-side and are never returned to clients.
 */
export async function getWorkspaceAiKeys(workspaceId) {
  const col = await dbConnect("ai_provider_configs");
  const doc = await col.findOne({ workspaceId: new ObjectId(workspaceId) });
  if (!doc?.providers) return {};

  const resolved = {};
  for (const [provider, encrypted] of Object.entries(doc.providers)) {
    const plain = decryptCredentials(encrypted);
    if (typeof plain === "string" && plain.trim()) {
      resolved[provider] = plain.trim();
    } else if (plain?.apiKey && typeof plain.apiKey === "string") {
      resolved[provider] = plain.apiKey.trim();
    }
  }
  return resolved;
}

function buildDirectModel(provider, directModelId, apiKey) {
  switch (provider) {
    case "anthropic":
      return createAnthropic({ apiKey })(directModelId);
    case "openai":
      return createOpenAI({ apiKey })(directModelId);
    case "deepseek":
      return createDeepSeek({ apiKey })(directModelId);
    case "google":
      return createGoogleGenerativeAI({ apiKey })(directModelId);
    default:
      throw new Error(`Unsupported direct AI provider: ${provider}`);
  }
}

/**
 * Hybrid AI Model Resolver:
 * 1. Uses Vercel AI Gateway (workspace gateway key, AI_GATEWAY_API_KEY, or VERCEL_OIDC_TOKEN)
 *    with request-scoped BYOK (`providerOptions.gateway.byok`) when workspace provider keys exist.
 * 2. Falls back to direct @ai-sdk/* provider adapters if no Gateway token is configured
 *    but a workspace BYOK key or direct provider env key is present.
 */
export async function resolveAgentModel({
  workspaceId,
  modelId,
  reasoningEffort = "high",
}) {
  const config = getModelConfig(modelId);
  const workspaceKeys = await getWorkspaceAiKeys(workspaceId);

  const gatewayKey = workspaceKeys.gateway || process.env.AI_GATEWAY_API_KEY;
  const hasOidc = Boolean(process.env.VERCEL_OIDC_TOKEN);
  const directKey = workspaceKeys[config.provider] || ENV_PROVIDER_KEYS[config.provider]?.();

  const safetyIdentifier = crypto
    .createHash("sha256")
    .update(String(workspaceId))
    .digest("hex")
    .slice(0, 32);

  if (gatewayKey || hasOidc) {
    const gw = workspaceKeys.gateway
      ? createGateway({ apiKey: workspaceKeys.gateway })
      : gateway;

    const gatewayOptions = {
      caching: "auto",
      safetyIdentifier,
      tags: ["feature:dripx-agent"],
    };

    const byokSlug = BYOK_GATEWAY_SLUGS[config.provider];
    if (workspaceKeys[config.provider] && byokSlug) {
      gatewayOptions.byok = {
        [byokSlug]: [{ apiKey: workspaceKeys[config.provider] }],
      };
    }

    return {
      model: gw(config.id),
      config,
      routeMode: workspaceKeys[config.provider] ? "gateway-byok" : "gateway",
      reasoning: config.supportsReasoning ? reasoningEffort : undefined,
      providerOptions: { gateway: gatewayOptions },
    };
  }

  if (directKey) {
    return {
      model: buildDirectModel(config.provider, config.directModelId, directKey),
      config,
      routeMode: workspaceKeys[config.provider] ? "direct-byok" : "direct-env",
      reasoning: config.supportsReasoning ? reasoningEffort : undefined,
      providerOptions: undefined,
    };
  }

  const err = new Error(
    `No AI credentials configured for ${config.label}. Add an AI Gateway key or ${config.provider} API key in Settings > AI Providers.`
  );
  err.code = "MISSING_AI_CREDENTIALS";
  throw err;
}
