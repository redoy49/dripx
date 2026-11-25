import assert from "node:assert/strict";
import test from "node:test";
import { AI_MODELS, DEFAULT_MODEL_ID, isAllowedModel, getModelConfig } from "./models.js";
import { encryptCredentials, decryptCredentials } from "../crypto.js";

test("AI model catalog validates allowed providers and rejects unknown slugs", () => {
  assert.ok(AI_MODELS.length >= 10);
  assert.equal(isAllowedModel("anthropic/claude-fable-5"), true);
  assert.equal(isAllowedModel("openai/gpt-6.2-sol"), true);
  assert.equal(isAllowedModel("deepseek/deepseek-v4-pro"), true);
  assert.equal(isAllowedModel("google/gemini-4-hydrogen"), true);
  assert.equal(isAllowedModel("evil/arbitrary-model"), false);
  assert.equal(getModelConfig("invalid").id, DEFAULT_MODEL_ID);
});

test("BYOK credentials encrypt and decrypt cleanly via AES-256-GCM", () => {
  const sampleKey = "sk-ant-api03-example-byok-secret-123456";
  const encrypted = encryptCredentials(sampleKey);
  assert.ok(encrypted.encryptedData && encrypted.iv && encrypted.authTag);
  assert.notEqual(encrypted.encryptedData, sampleKey);
  assert.equal(decryptCredentials(encrypted), sampleKey);
});
