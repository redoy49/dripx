/**
 * Universal AI Provider registry supporting multi-model aggregators
 * (River AI, OpenRouter, Groq, Vercel AI Gateway, Custom OpenAI-compatible)
 * and direct single-provider APIs (Anthropic, OpenAI, DeepSeek, Google).
 */

export const PROVIDER_PRESETS = [
  {
    id: "river",
    label: "River AI (console.river.ai)",
    kind: "openai-compatible",
    defaultBaseUrl: "https://api.river.ai/v1",
    keyPrefix: "rv_",
    placeholder: "rv_...",
    hint: "One key unlocks DeepSeek, Gemini, GLM & other hosted models via api.river.ai/v1",
    allowCustomBaseUrl: true,
  },
  {
    id: "openrouter",
    label: "OpenRouter",
    kind: "openai-compatible",
    defaultBaseUrl: "https://openrouter.ai/api/v1",
    keyPrefix: "sk-or-",
    placeholder: "sk-or-v1-...",
    hint: "Access Claude, ChatGPT, DeepSeek, Gemini & free models with one OpenRouter key",
    allowCustomBaseUrl: false,
  },
  {
    id: "gateway",
    label: "Vercel AI Gateway",
    kind: "gateway",
    defaultBaseUrl: "https://ai-gateway.vercel.sh/v1",
    keyPrefix: "vck_",
    placeholder: "vck_...",
    hint: "Unified routing & failover across Claude, OpenAI, DeepSeek & Gemini",
    allowCustomBaseUrl: false,
  },
  {
    id: "groq",
    label: "Groq (Free / Fast Tier)",
    kind: "openai-compatible",
    defaultBaseUrl: "https://api.groq.com/openai/v1",
    keyPrefix: "gsk_",
    placeholder: "gsk_...",
    hint: "Ultra-fast inference for open & DeepSeek models",
    allowCustomBaseUrl: false,
  },
  {
    id: "anthropic",
    label: "Anthropic (Claude Direct)",
    kind: "anthropic",
    defaultBaseUrl: "https://api.anthropic.com/v1",
    keyPrefix: "sk-ant-",
    placeholder: "sk-ant-...",
    hint: "Official Anthropic Claude API key",
    allowCustomBaseUrl: false,
  },
  {
    id: "openai",
    label: "OpenAI (ChatGPT Direct)",
    kind: "openai",
    defaultBaseUrl: "https://api.openai.com/v1",
    keyPrefix: "sk-",
    placeholder: "sk-proj-...",
    hint: "Official OpenAI API key",
    allowCustomBaseUrl: false,
  },
  {
    id: "deepseek",
    label: "DeepSeek Direct",
    kind: "deepseek",
    defaultBaseUrl: "https://api.deepseek.com",
    keyPrefix: "sk-",
    placeholder: "sk-...",
    hint: "Official api.deepseek.com key (not for River/OpenRouter)",
    allowCustomBaseUrl: false,
  },
  {
    id: "google",
    label: "Google (Gemini Direct)",
    kind: "google",
    defaultBaseUrl: "https://generativelanguage.googleapis.com/v1beta",
    keyPrefix: "AIza",
    placeholder: "AIza...",
    hint: "Official Google AI Studio / Gemini API key",
    allowCustomBaseUrl: false,
  },
  {
    id: "custom",
    label: "Custom OpenAI-Compatible",
    kind: "openai-compatible",
    defaultBaseUrl: "",
    keyPrefix: "",
    placeholder: "sk-... or provider token",
    hint: "Any OpenAI-compatible provider or proxy URL supporting /v1/models",
    allowCustomBaseUrl: true,
  },
];

export const PROVIDER_PRESET_MAP = new Map(PROVIDER_PRESETS.map((p) => [p.id, p]));

export function getProviderPreset(providerId) {
  return PROVIDER_PRESET_MAP.get(providerId) || null;
}

export function detectProviderFromKey(apiKey = "") {
  const key = apiKey.trim();
  if (key.startsWith("rv_")) return "river";
  if (key.startsWith("sk-or-")) return "openrouter";
  if (key.startsWith("sk-ant-")) return "anthropic";
  if (key.startsWith("vck_")) return "gateway";
  if (key.startsWith("gsk_")) return "groq";
  if (key.startsWith("AIza")) return "google";
  return null;
}

/**
 * Validates custom base URLs against SSRF (must be HTTPS in production, no private/loopback IPs).
 */
export function normalizeSafeBaseUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") return null;
  try {
    const parsed = new URL(rawUrl.trim().replace(/\/+$/, ""));
    if (!["https:", "http:"].includes(parsed.protocol)) return null;
    const host = parsed.hostname.toLowerCase();
    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "0.0.0.0" ||
      host === "::1" ||
      host.startsWith("10.") ||
      host.startsWith("192.168.") ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
      host.endsWith(".internal")
    ) {
      return null;
    }
    if (parsed.protocol !== "https:") return null;
    return parsed.toString().replace(/\/+$/, "");
  } catch {
    return null;
  }
}
