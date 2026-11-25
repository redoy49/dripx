import crypto from "node:crypto";

/**
 * Strips `null` / `undefined` top-level metadata keys from UIMessages and their parts.
 * MongoDB BSON converts `undefined` object properties into `null`, which breaks
 * AI SDK v7 `validateUIMessages` Zod checks (e.g. `providerMetadata: null`).
 * Preserves `part.input` and `part.output` payloads intact.
 */
export function sanitizeUIMessages(messages = []) {
  if (!Array.isArray(messages)) return [];
  return messages.map((msg) => {
    const cleanMsg = {
      id: msg?.id && String(msg.id).trim() ? String(msg.id) : crypto.randomUUID(),
      role: msg?.role || "assistant",
      parts: Array.isArray(msg?.parts)
        ? msg.parts.map((part) => {
            if (!part || typeof part !== "object") return part;
            const cleanPart = {};
            for (const [k, v] of Object.entries(part)) {
              if (v !== null && v !== undefined) {
                cleanPart[k] = v;
              }
            }
            return cleanPart;
          })
        : [],
    };
    if (msg?.metadata != null) cleanMsg.metadata = msg.metadata;
    return cleanMsg;
  });
}
