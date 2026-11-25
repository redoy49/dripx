import assert from "node:assert/strict";
import test from "node:test";
import { validateUIMessages } from "ai";
import { detectProviderFromKey, normalizeSafeBaseUrl } from "./providers.js";
import { classifyModelBrand, formatModelLabel } from "./modelDiscovery.js";
import { sanitizeUIMessages } from "./sanitizeMessages.js";
import { encryptCredentials, decryptCredentials } from "../crypto.js";

test("detectProviderFromKey identifies River AI, OpenRouter, Anthropic, Gateway, and Gemini keys", () => {
  assert.equal(detectProviderFromKey("rv_123456"), "river");
  assert.equal(detectProviderFromKey("sk-or-v1-abc"), "openrouter");
  assert.equal(detectProviderFromKey("sk-ant-api03-xyz"), "anthropic");
  assert.equal(detectProviderFromKey("vck_abc123"), "gateway");
  assert.equal(detectProviderFromKey("AIzaSyTest123"), "google");
  assert.equal(detectProviderFromKey("unknown_key"), null);
});

test("normalizeSafeBaseUrl blocks SSRF private/http URLs and allows valid HTTPS endpoints", () => {
  assert.equal(normalizeSafeBaseUrl("https://api.river.ai/v1/"), "https://api.river.ai/v1");
  assert.equal(normalizeSafeBaseUrl("http://api.river.ai/v1"), null);
  assert.equal(normalizeSafeBaseUrl("https://localhost:3000/v1"), null);
  assert.equal(normalizeSafeBaseUrl("https://127.0.0.1/v1"), null);
  assert.equal(normalizeSafeBaseUrl("https://192.168.1.5/v1"), null);
});

test("classifyModelBrand and formatModelLabel categorize multi-provider models accurately", () => {
  assert.equal(classifyModelBrand("deepseek-ai/DeepSeek-V4.1-Flash"), "deepseek");
  assert.equal(classifyModelBrand("google/gemini-4-hydrogen"), "google");
  assert.equal(classifyModelBrand("anthropic/claude-fable-5"), "anthropic");
  assert.equal(classifyModelBrand("openai/gpt-6.2-sol"), "openai");
  assert.equal(classifyModelBrand("zai-org/GLM-5.3-Flash"), "other");
  assert.equal(formatModelLabel("deepseek-ai/DeepSeek-V4.1-Flash"), "DeepSeek V4.1 Flash");
});

test("BYOK credentials encrypt and decrypt cleanly via AES-256-GCM", () => {
  const payload = { apiKey: "rv_test_secret_1234", baseUrl: "https://api.river.ai/v1" };
  const encrypted = encryptCredentials(payload);
  assert.ok(encrypted.encryptedData && encrypted.iv && encrypted.authTag);
  assert.deepEqual(decryptCredentials(encrypted), payload);
});

test("sanitizeUIMessages strips MongoDB BSON nulls so AI SDK validateUIMessages passes", async () => {
  const rawFromMongo = [
    {
      id: "",
      metadata: null,
      role: "assistant",
      parts: [
        { type: "step-start" },
        { type: "text", text: "Created campaign", providerMetadata: null, state: "done" },
        {
          type: "tool-createCampaignDraft",
          toolCallId: "call_0",
          state: "output-available",
          title: null,
          input: { name: "November Email", channels: ["email"] },
          output: { id: "6b06e160b4a0c096368bd33e", senderEmailAccountId: null },
          rawInput: null,
          errorText: null,
          providerExecuted: null,
          preliminary: null,
        },
      ],
    },
    { id: "u1", role: "user", parts: [{ type: "text", text: "build default sequence" }] },
  ];

  const clean = sanitizeUIMessages(rawFromMongo);
  const validated = await validateUIMessages({ messages: clean });
  assert.equal(validated.length, 2);
  assert.ok(validated[0].id.length > 0);
  assert.equal(validated[0].parts[2].output.senderEmailAccountId, null);
});
