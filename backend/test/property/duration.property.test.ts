import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { normalizeDuration } from "../../src/feeds/duration";

const NUM_RUNS = 200;

describe("normalizeDuration — property", () => {
  it("never throws and never returns NaN for arbitrary input (string, number, null, undefined)", () => {
    fc.assert(
      fc.property(
        fc.oneof(fc.string(), fc.double(), fc.integer(), fc.constant(null), fc.constant(undefined)),
        (raw) => {
          const result = normalizeDuration(raw as string | number | null | undefined);

          // seconds is either null, or a finite non-negative integer — never NaN/Infinity.
          const secondsOk =
            result.seconds === null ||
            (Number.isFinite(result.seconds) && Number.isInteger(result.seconds) && result.seconds >= 0);
          expect(secondsOk).toBe(true);

          // whenever seconds is null, a human-readable reason is always attached.
          if (result.seconds === null) {
            expect(typeof result.reasonIfNull).toBe("string");
            expect((result.reasonIfNull ?? "").length).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: NUM_RUNS }
    );
  });

  it("round-trips bare-seconds strings", () => {
    fc.assert(
      fc.property(fc.nat({ max: 999_999 }), (n) => {
        const result = normalizeDuration(String(n));
        expect(result.seconds).toBe(n);
        expect(result.reasonIfNull).toBeUndefined();
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it("round-trips MM:SS strings", () => {
    fc.assert(
      fc.property(fc.nat({ max: 999 }), fc.nat({ max: 59 }), (mm, ss) => {
        const result = normalizeDuration(`${mm}:${ss}`);
        expect(result.seconds).toBe(mm * 60 + ss);
        expect(result.reasonIfNull).toBeUndefined();
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it("round-trips HH:MM:SS strings", () => {
    fc.assert(
      fc.property(fc.nat({ max: 999 }), fc.nat({ max: 59 }), fc.nat({ max: 59 }), (hh, mm, ss) => {
        const result = normalizeDuration(`${hh}:${mm}:${ss}`);
        expect(result.seconds).toBe(hh * 3600 + mm * 60 + ss);
        expect(result.reasonIfNull).toBeUndefined();
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it("garbage text (contains a letter, so can never match a numeric/colon shape) is always null-with-reason, never NaN", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter((s) => /[a-zA-Z]/.test(s)),
        (garbage) => {
          const result = normalizeDuration(garbage);
          expect(result.seconds).toBeNull();
          expect(Number.isNaN(result.seconds)).toBe(false);
          expect(typeof result.reasonIfNull).toBe("string");
          expect((result.reasonIfNull ?? "").length).toBeGreaterThan(0);
        }
      ),
      { numRuns: NUM_RUNS }
    );
  });
});
