/**
 * Brand grouping constants and platform-level fallback catalog (used only when
 * platform AI_GATEWAY_API_KEY / VERCEL_OIDC_TOKEN is active without workspace BYOK).
 */

export const BRAND_GROUPS = [
  { id: "anthropic", label: "Anthropic (Claude)", dot: "bg-orange-500" },
  { id: "openai", label: "OpenAI (ChatGPT)", dot: "bg-emerald-500" },
  { id: "deepseek", label: "DeepSeek", dot: "bg-sky-500" },
  { id: "google", label: "Google (Gemini)", dot: "bg-indigo-500" },
  { id: "other", label: "Other Models", dot: "bg-gray-400" },
];

export const DEFAULT_MODEL_ID = "anthropic/claude-fable-5";

export const PLATFORM_FALLBACK_MODELS = [
  { id: "anthropic/claude-fable-5", label: "Claude Fable 5", brand: "anthropic", sourceProviderId: "gateway", supportsReasoning: true, supportsTools: true },
  { id: "anthropic/claude-sonnet-5.5", label: "Claude Sonnet 5.5", brand: "anthropic", sourceProviderId: "gateway", supportsReasoning: true, supportsTools: true },
  { id: "anthropic/claude-opus-5.5", label: "Claude Opus 5.5", brand: "anthropic", sourceProviderId: "gateway", supportsReasoning: true, supportsTools: true },
  { id: "openai/gpt-6.2-sol", label: "GPT-6.2 Sol", brand: "openai", sourceProviderId: "gateway", supportsReasoning: true, supportsTools: true },
  { id: "openai/gpt-5.4", label: "GPT-5.4", brand: "openai", sourceProviderId: "gateway", supportsReasoning: true, supportsTools: true },
  { id: "deepseek/deepseek-v4-pro", label: "DeepSeek V4 Pro", brand: "deepseek", sourceProviderId: "gateway", supportsReasoning: true, supportsTools: true },
  { id: "deepseek/deepseek-v4.1-flash", label: "DeepSeek V4.1 Flash", brand: "deepseek", sourceProviderId: "gateway", supportsReasoning: false, supportsTools: true },
  { id: "google/gemini-4-hydrogen", label: "Gemini 4 Hydrogen", brand: "google", sourceProviderId: "gateway", supportsReasoning: true, supportsTools: true },
  { id: "google/gemini-4-neon", label: "Gemini 4 Neon", brand: "google", sourceProviderId: "gateway", supportsReasoning: false, supportsTools: true },
];
