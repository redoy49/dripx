import assert from "node:assert/strict";
import test from "node:test";
import { renderTemplate, resolveSpintax } from "./personalization.js";

test("resolveSpintax picks variants deterministically with custom rng and supports nesting", () => {
  assert.equal(resolveSpintax("{Hi|Hello|Hey} there", () => 0), "Hi there");
  assert.equal(resolveSpintax("{Hi|Hello|Hey} there", () => 0.4), "Hello there");
  assert.equal(resolveSpintax("{Hi|Hello|Hey} there", () => 0.99), "Hey there");

  // Nested spintax
  const nested = "{Hi {there|friend}|Hello}";
  assert.equal(resolveSpintax(nested, () => 0), "Hi there");
  assert.equal(resolveSpintax(nested, () => 0.99), "Hello");
});

test("resolveSpintax leaves non-spintax braces (JSON/CSS/single tokens) untouched", () => {
  const html = "<style>body { color: red; }</style><p>{unchanged}</p>";
  assert.equal(resolveSpintax(html, () => 0), html);
});

test("renderTemplate resolves {{variables}} with fallbacks AND {spintax} together", () => {
  const lead = { firstName: "Ridoy", company: "DripX" };
  const tpl = "{Hi|Hello|Hey} {{firstName|there}}, {quick question|wanted to share an idea} about {{company}}.";

  assert.equal(
    renderTemplate(tpl, lead, { rng: () => 0 }),
    "Hi Ridoy, quick question about DripX."
  );
  assert.equal(
    renderTemplate(tpl, {}, { rng: () => 0.5 }),
    "Hello there, wanted to share an idea about ."
  );
});

test("renderTemplate produces randomized variations at send time with default Math.random", () => {
  const tpl = "{Hi|Hello|Hey|Greetings} {{firstName}}";
  const seen = new Set();
  for (let i = 0; i < 40; i++) {
    seen.add(renderTemplate(tpl, { firstName: "Alex" }));
  }
  assert.ok(seen.size > 1, "Expected multiple randomized spintax outputs");
});
