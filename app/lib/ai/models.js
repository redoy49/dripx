/**
 * Curated multi-provider AI model catalog for DripX AI Agent.
 * IDs follow Vercel AI Gateway `provider/model` slugs verified against /v1/models,
 * with `directModelId` mappings when falling back to direct provider API keys.
 */

export const DEFAULT_MODEL_ID = "anthropic/claude-fable-5";

export const AI_PROVIDERS = [
  { id: "gateway", label: "Vercel AI Gateway", envHint: "AI_GATEWAY_API_KEY" },
  { id: "anthropic", label: "Anthropic (Claude)", envHint: "ANTHROPIC_API_KEY" },
  { id: "openai", label: "OpenAI (ChatGPT)", envHint: "OPENAI_API_KEY" },
  { id: "deepseek", label: "DeepSeek", envHint: "DEEPSEEK_API_KEY" },
  { id: "google", label: "Google (Gemini)", envHint: "GOOGLE_GENERATIVE_AI_API_KEY" },
];

export const AI_MODELS = [
  {
    id: "anthropic/claude-fable-5",
    provider: "anthropic",
    label: "Claude Fable 5",
    shortLabel: "Fable 5",
    directModelId: "claude-sonnet-4-5",
    badge: "Flagship",
    supportsReasoning: true,
    supportsTools: true,
    description: "Best for multi-step DripX campaign architecture & tool execution",
  },
  {
    id: "anthropic/claude-sonnet-5.5",
    provider: "anthropic",
    label: "Claude Sonnet 5.5",
    shortLabel: "Sonnet 5.5",
    directModelId: "claude-sonnet-4-5",
    badge: "Fast Agent",
    supportsReasoning: true,
    supportsTools: true,
    description: "Fast copywriting, sequence building, and inbox triage",
  },
  {
    id: "anthropic/claude-opus-5.5",
    provider: "anthropic",
    label: "Claude Opus 5.5",
    shortLabel: "Opus 5.5",
    directModelId: "claude-opus-4-1",
    badge: "Deep Think",
    supportsReasoning: true,
    supportsTools: true,
    description: "Deep strategic outreach audits and complex branching",
  },
  {
    id: "openai/gpt-6.2-sol",
    provider: "openai",
    label: "GPT-6.2 Sol",
    shortLabel: "GPT-6.2",
    directModelId: "gpt-4.1",
    badge: "Frontier",
    supportsReasoning: true,
    supportsTools: true,
    description: "OpenAI flagship reasoning and structured workflow planning",
  },
  {
    id: "openai/gpt-5.4",
    provider: "openai",
    label: "GPT-5.4",
    shortLabel: "GPT-5.4",
    directModelId: "gpt-4.1",
    badge: "Balanced",
    supportsReasoning: true,
    supportsTools: true,
    description: "Reliable tool calling and persuasive B2B copy",
  },
  {
    id: "openai/gpt-5.3-codex",
    provider: "openai",
    label: "GPT-5.3 Codex",
    shortLabel: "Codex 5.3",
    directModelId: "gpt-4.1",
    badge: "Builder",
    supportsReasoning: true,
    supportsTools: true,
    description: "Precision JSON sequence graphs & filter generation",
  },
  {
    id: "deepseek/deepseek-v4-pro",
    provider: "deepseek",
    label: "DeepSeek V4 Pro",
    shortLabel: "DeepSeek V4",
    directModelId: "deepseek-chat",
    badge: "High Value",
    supportsReasoning: true,
    supportsTools: true,
    description: "Strong analytical reasoning at minimal token cost",
  },
  {
    id: "deepseek/deepseek-v4.1-flash",
    provider: "deepseek",
    label: "DeepSeek V4.1 Flash",
    shortLabel: "DS Flash",
    directModelId: "deepseek-chat",
    badge: "Ultra Fast",
    supportsReasoning: false,
    supportsTools: true,
    description: "Low-latency replies, lead tagging, and quick edits",
  },
  {
    id: "deepseek/deepseek-r1",
    provider: "deepseek",
    label: "DeepSeek R1",
    shortLabel: "DeepSeek R1",
    directModelId: "deepseek-reasoner",
    badge: "Reasoning",
    supportsReasoning: true,
    supportsTools: false,
    description: "Deep step-by-step deliverability & strategy thinking",
  },
  {
    id: "google/gemini-4-hydrogen",
    provider: "google",
    label: "Gemini 4 Hydrogen",
    shortLabel: "Gemini 4",
    directModelId: "gemini-2.5-pro",
    badge: "Synthesis",
    supportsReasoning: true,
    supportsTools: true,
    description: "Long-context analytics & multi-channel campaign synthesis",
  },
  {
    id: "google/gemini-4-neon",
    provider: "google",
    label: "Gemini 4 Neon",
    shortLabel: "Gemini Neon",
    directModelId: "gemini-2.5-flash",
    badge: "Instant",
    supportsReasoning: false,
    supportsTools: true,
    description: "Sub-second answers and rapid inbox summaries",
  },
];

export const ALLOWED_MODEL_MAP = new Map(AI_MODELS.map((m) => [m.id, m]));

export function isAllowedModel(modelId) {
  return ALLOWED_MODEL_MAP.has(modelId);
}

export function getModelConfig(modelId) {
  return ALLOWED_MODEL_MAP.get(modelId) || ALLOWED_MODEL_MAP.get(DEFAULT_MODEL_ID);
}
