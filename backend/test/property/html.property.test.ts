import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { sanitizeHtmlToText } from "../../src/feeds/html";

const NUM_RUNS = 200;

// Mix of general unicode fuzzing and hand-picked HTML/entity fragments,
// concatenated into soup — this is closer to real feed-controlled input
// (mismatched tags, entity-encoded markup, tracking pixels) than pure
// random unicode alone would exercise.
const htmlFragment = fc.oneof(
  fc.constantFrom(
    "<p>",
    "</p>",
    "<div>",
    "</div>",
    "<br>",
    "<br/>",
    "<script>",
    "</script>",
    "<style>",
    "</style>",
    "<img src=x>",
    "<a href='x'>",
    "</a>",
    "&amp;",
    "&lt;",
    "&gt;",
    "&#60;",
    "&#x3c;",
    "&amp;lt;",
    "&nbsp;",
    "&mdash;",
    "text",
    " ",
    "\n",
    "<",
    ">",
    "&"
  ),
  fc.string({ maxLength: 5 })
);

const htmlSoup = fc.array(htmlFragment, { maxLength: 20 }).map((parts) => parts.join(""));

const inputArbitrary = fc.oneof(fc.string(), htmlSoup);

describe("sanitizeHtmlToText — property", () => {
  it("never throws on arbitrary strings", () => {
    fc.assert(
      fc.property(inputArbitrary, (s) => {
        expect(() => sanitizeHtmlToText(s)).not.toThrow();
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it("output never contains a raw '<' (no tag, encoded or otherwise, survives)", () => {
    fc.assert(
      fc.property(inputArbitrary, (s) => {
        const out = sanitizeHtmlToText(s);
        expect(out.includes("<")).toBe(false);
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it("is idempotent: sanitizing already-sanitized output is a no-op", () => {
    fc.assert(
      fc.property(inputArbitrary, (s) => {
        const once = sanitizeHtmlToText(s);
        const twice = sanitizeHtmlToText(once);
        expect(twice).toBe(once);
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it("handles null/undefined without throwing", () => {
    expect(() => sanitizeHtmlToText(null)).not.toThrow();
    expect(() => sanitizeHtmlToText(undefined)).not.toThrow();
    expect(sanitizeHtmlToText(null)).toBe("");
    expect(sanitizeHtmlToText(undefined)).toBe("");
  });
});
