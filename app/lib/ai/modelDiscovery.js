import { getProviderPreset, normalizeSafeBaseUrl } from "./providers.js";

const NON_CHAT_REGEX = /(embedding|whisper|tts|dall-e|imagen|veo|moderation|realtime|transcribe|audio|speech|sora|flux)/i;

export function classifyModelBrand(rawId = "") {
  const lower = rawId.toLowerCase();
  if (/(anthropic|claude|fable|sonnet|opus|haiku)/.test(lower)) return "anthropic";
  if (/(openai|gpt-|chatgpt|codex|\bo1\b|\bo3\b|\bo4\b|\/o1|\/o3|\/o4)/.test(lower)) return "openai";
  if (/deepseek/.test(lower)) return "deepseek";
  if (/(google|gemini|gemma)/.test(lower)) return "google";
  return "other";
}

export function formatModelLabel(rawId = "") {
  const tail = rawId.includes("/") ? rawId.split("/").slice(1).join("/") : rawId;
  return tail
    .replace(/:free$/i, " (Free)")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function inferCapabilities(rawId = "", entry = {}) {
  const lower = rawId.toLowerCase();
  const tags = Array.isArray(entry.tags) ? entry.tags : [];
  const supported = Array.isArray(entry.supported_parameters) ? entry.supported_parameters : [];

  const isPureReasoner = /(deepseek-r1|reasoner|\bo1\b|\bo3-mini\b)/.test(lower);
  const supportsReasoning =
    tags.includes("reasoning") ||
    supported.includes("reasoning") ||
    /(r1|thinking|reasoner|fable|opus|sonnet-5|gpt-5|gpt-6|o1|o3|o4|gemini-2\.5-pro|gemini-4)/.test(lower);

  const supportsTools =
    tags.includes("tool-use") ||
    supported.includes("tools") ||
    !isPureReasoner;

  return { supportsReasoning, supportsTools };
}

function mapRawModels(rawItems, sourceProviderId) {
  const seen = new Set();
  const mapped = [];

  for (const item of rawItems || []) {
    const id =
      typeof item === "string"
        ? item.trim()
        : item?.id || item?.model || item?.model_id || item?.slug || item?.name?.replace(/^models\//, "");
    if (!id || seen.has(id) || NON_CHAT_REGEX.test(id)) continue;
    if (item?.type && /(embedding|image|audio|video|moderation|tts|whisper)/i.test(String(item.type))) continue;
    if (Array.isArray(item?.supportedGenerationMethods) && !item.supportedGenerationMethods.includes("generateContent")) {
      continue;
    }

    seen.add(id);
    const { supportsReasoning, supportsTools } = inferCapabilities(id, item);
    mapped.push({
      id,
      label: formatModelLabel(id),
      brand: classifyModelBrand(id),
      sourceProviderId,
      supportsReasoning,
      supportsTools,
    });
  }

  return mapped;
}

export function parseManualModelIds(rawText = "") {
  return String(rawText)
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Authenticates against a provider's live /models endpoint using the supplied API key
 * and returns the list of chat-capable models unlocked for that key.
 */
export async function fetchProviderModels({ providerId, apiKey, baseUrl, manualModels = "" }) {
  const preset = getProviderPreset(providerId);
  if (!preset) throw new Error(`Unknown provider: ${providerId}`);
  if (!apiKey || !apiKey.trim()) throw new Error("API key is required");

  const trimmedKey = apiKey.trim();
  const resolvedBase = baseUrl
    ? normalizeSafeBaseUrl(baseUrl)
    : preset.defaultBaseUrl;

  if (!resolvedBase) {
    throw new Error(`A valid HTTPS Base URL is required for ${preset.label}.`);
  }

  const manualList = mapRawModels(parseManualModelIds(manualModels), providerId);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);

  try {
    let url = `${resolvedBase}/models`;
    const headers = { Accept: "application/json" };

    if (preset.kind === "anthropic") {
      headers["x-api-key"] = trimmedKey;
      headers["anthropic-version"] = "2023-06-01";
    } else if (preset.kind === "anthropic-compatible") {
      headers["x-api-key"] = trimmedKey;
      headers["anthropic-version"] = "2023-06-01";
      headers.Authorization = `Bearer ${trimmedKey}`;
    } else if (preset.kind === "google") {
      url = `${resolvedBase}/models?key=${encodeURIComponent(trimmedKey)}`;
    } else {
      headers.Authorization = `Bearer ${trimmedKey}`;
    }

    const res = await fetch(url, { method: "GET", headers, signal: controller.signal });
    const text = await res.text();
    let json = {};
    try {
      json = JSON.parse(text);
    } catch {}

    if (!res.ok) {
      if ((res.status === 404 || res.status === 405) && manualList.length > 0) {
        return { ok: true, baseUrl: resolvedBase, models: manualList };
      }
      const apiErr = json?.error?.message || json?.message || `HTTP ${res.status}`;
      throw new Error(`${preset.label} rejected key: ${apiErr}`);
    }

    const rawList = Array.isArray(json.data)
      ? json.data
      : Array.isArray(json.models)
      ? json.models
      : Array.isArray(json.result)
      ? json.result
      : Array.isArray(json.data?.models)
      ? json.data.models
      : Array.isArray(json.data?.data)
      ? json.data.data
      : Array.isArray(json)
      ? json
      : [];

    const discovered = mapRawModels(rawList, providerId);
    const models = discovered.length > 0 ? discovered : manualList;

    if (models.length === 0) {
      throw new Error(
        `Connected to ${preset.label}, but /models returned 0 models. Enter Manual Model IDs below (e.g. claude-sonnet-4-5, gpt-4o) and try again.`
      );
    }

    return { ok: true, baseUrl: resolvedBase, models };
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error(`Timed out connecting to ${preset.label} (${resolvedBase}).`);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}
