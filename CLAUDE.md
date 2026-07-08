# Foray — agent guide

Personal AI podcast curator. Live site: https://wjduvall-cmd.github.io/foray/ (GitHub Pages, deploys from main branch root).

## Verify before committing

- Backend: `cd backend && npm test` (includes `test/copyRules.test.ts`, which gates ALL user-facing copy in `data/*.json`)
- Site JS: `node --check app.js`
- Data integrity: CI (`.github/workflows/ci.yml`) validates all JSON + session episode refs on push

## Product principles (supersede everything, including marketing findings)

1. **Curiosity/learning first; anti-echo-chamber.** Discovery surfaces keep a hard ~30% exploration floor. No engagement dark patterns (no streaks, no infinite scroll, no autoplay chains).
2. **State observed, never declared.** No config fields or manual "done" declarations where observation is possible. Commute length is a learned parameter, never UI copy.
3. **Legally boring.** Never rehost/proxy/transform episode audio; never strip ads; download via original enclosure URLs. Any "skip the sponsor" feature request triggers legal review.
4. **Copy rules:** why-lines ≤ 18 words, hooks ≤ 16; banned: "fascinating", "deep dive", "delve", "explores", clickbait withholding, commute-length framing. Stretch picks must state their bridge.

## Layout

- Root: static site (index.html, app.js, styles.css) + `data/*.json` (session doc v1, taxonomy, discover pool, catalog)
- `backend/`: Node/TS — ingest, dedup, cost metering, curation engine, session-builder CLI. Runs keyless in dry-run (StubEnricher); real keys go in root `.env` (gitignored).
- `ios/`: SwiftUI app + ForayKit Swift package (state machine + intent grammar, unit-tested). Builds only on macOS via XcodeGen. `// AUDIT:` marks unverified AVFoundation behavior.
- `docs/brief/`: original product spec (master prompt, curation spec, corner cases, roadmap — read these first)
- `docs/adr/`, `docs/DECISIONS.md`: decisions. `docs/marketing/`: research + pre-mortem. `docs/research/`: agent research outputs.

## Conventions

- All escaping in app.js goes through `esc()`; all href/src through `safeUrl()`. The page has a strict CSP — no inline styles/scripts.
- localStorage keys keep the legacy `cp_` prefix (renaming would wipe user state).
- `user_id` on every backend table and route — no single-tenant schema shortcuts.
- Every LLM call routes through the cost-metering budget guard.
