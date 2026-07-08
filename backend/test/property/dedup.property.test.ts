import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { isSameEpisode, normalizeTitle, type EpisodeIdentityInput } from "../../src/identity/dedup";

const NUM_RUNS = 200;

const isoDateArb = fc
  .integer({ min: Date.UTC(2015, 0, 1), max: Date.UTC(2030, 0, 1) })
  .map((ms) => new Date(ms).toISOString());

const episodeArb: fc.Arbitrary<EpisodeIdentityInput> = fc.record({
  title: fc.string(),
  publishedAt: fc.option(isoDateArb, { nil: null }),
  durationSeconds: fc.option(fc.integer({ min: 0, max: 100_000 }), { nil: null })
});

// Word-like titles guaranteed to normalize to something non-empty, for the
// tolerance-window tests where we want title match to be a non-factor.
const nonEmptyTitleArb = fc
  .array(fc.constantFrom("a", "b", "c", "d", "e", "1", "2", "3", "x", "y", "z", "0"), {
    minLength: 1,
    maxLength: 12
  })
  .map((chars) => chars.join(""));

const baseDateMsArb = fc.integer({ min: Date.UTC(2015, 0, 1), max: Date.UTC(2030, 0, 1) });
const baseDurationArb = fc.integer({ min: 200, max: 50_000 });

describe("isSameEpisode — property", () => {
  it("is symmetric: isSameEpisode(a, b) === isSameEpisode(b, a)", () => {
    fc.assert(
      fc.property(episodeArb, episodeArb, (a, b) => {
        expect(isSameEpisode(a, b)).toBe(isSameEpisode(b, a));
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it("is reflexive iff the title normalizes to something non-empty", () => {
    fc.assert(
      fc.property(episodeArb, (a) => {
        const expectMatch = normalizeTitle(a.title).length > 0;
        expect(isSameEpisode(a, a)).toBe(expectMatch);
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it("still matches for perturbations within tolerance (±1 day, ±90s)", () => {
    fc.assert(
      fc.property(
        nonEmptyTitleArb,
        baseDateMsArb,
        baseDurationArb,
        fc.integer({ min: -86_000_000, max: 86_000_000 }), // safely under 1 day in ms
        fc.integer({ min: -89, max: 89 }), // safely under 90s
        (title, dateMs, duration, dateOffsetMs, durationOffsetS) => {
          const a: EpisodeIdentityInput = {
            title,
            publishedAt: new Date(dateMs).toISOString(),
            durationSeconds: duration
          };
          const b: EpisodeIdentityInput = {
            title,
            publishedAt: new Date(dateMs + dateOffsetMs).toISOString(),
            durationSeconds: duration + durationOffsetS
          };
          expect(isSameEpisode(a, b)).toBe(true);
        }
      ),
      { numRuns: NUM_RUNS }
    );
  });

  it("stops matching once the date drifts beyond the ±1 day tolerance (duration held fixed)", () => {
    fc.assert(
      fc.property(
        nonEmptyTitleArb,
        baseDateMsArb,
        baseDurationArb,
        fc.integer({ min: 2, max: 30 }), // days beyond tolerance
        fc.boolean(),
        (title, dateMs, duration, extraDays, sign) => {
          const offsetMs = (sign ? 1 : -1) * extraDays * 86_400_000;
          const a: EpisodeIdentityInput = {
            title,
            publishedAt: new Date(dateMs).toISOString(),
            durationSeconds: duration
          };
          const b: EpisodeIdentityInput = {
            title,
            publishedAt: new Date(dateMs + offsetMs).toISOString(),
            durationSeconds: duration
          };
          expect(isSameEpisode(a, b)).toBe(false);
        }
      ),
      { numRuns: NUM_RUNS }
    );
  });

  it("stops matching once duration drifts beyond the ±90s tolerance (date held fixed)", () => {
    fc.assert(
      fc.property(
        nonEmptyTitleArb,
        baseDateMsArb,
        baseDurationArb,
        fc.integer({ min: 91, max: 5000 }), // seconds beyond tolerance
        fc.boolean(),
        (title, dateMs, duration, extraSeconds, sign) => {
          const a: EpisodeIdentityInput = {
            title,
            publishedAt: new Date(dateMs).toISOString(),
            durationSeconds: duration
          };
          const b: EpisodeIdentityInput = {
            title,
            publishedAt: new Date(dateMs).toISOString(),
            durationSeconds: duration + (sign ? extraSeconds : -extraSeconds)
          };
          expect(isSameEpisode(a, b)).toBe(false);
        }
      ),
      { numRuns: NUM_RUNS }
    );
  });
});
