# When the Anthropic key lands — the R1 runbook

The pre-mortem's verdict: the single assumption most worth testing is whether the
**automated pipeline with no architect-in-the-loop** produces menus you actually pick
from. Everything else — iOS, voice, TTS, monetization — is downstream. Here's the
sequence, ready to go:

1. **Paste the key** into `.env` (`ANTHROPIC_API_KEY=...`). Podcast Index key too if it
   ever arrives — not required.
2. **Real-mode session build:** `cd backend && npm run build-session` — with the key
   present it switches from StubEnricher to the live enricher automatically, metered
   against `DAILY_BUDGET_USD` (currently $2.00/day in .env). Inspect
   `backend/output/session-*.json`: are the why-lines specific? Is the menu diverse?
3. **Deploy a machine-built session:** copy the output over `data/session.json`
   (keep `"builder": "machine-v1"` — the client logs it into every event), commit, push.
   The site updates in ~1 minute.
4. **The blind test (R1):** across the next ~2 weeks, most days get machine-built
   menus; 1–2 days a week Claude hand-curates one (`"builder": "hand-architect-v1"`),
   with no visual difference. You judge menus honestly without knowing which is which.
   Your picks accumulate in localStorage tagged by builder. To read the ledger:
   open the site → browser console → `JSON.parse(localStorage.cp_events)` — or ask
   Claude to add an export view (one small task, allowed under the feature freeze
   as R2 instrumentation).
5. **Weekly:** one unconstrained build (no budget cap, frontier model) alongside the
   budget builds — measures the quality-per-dollar curve directly.

**Decision rule (pre-committed):** if machine menus' lead-card pick-rate is under half
of hand menus' over ~10 sessions, the next effort goes to curation depth (transcripts,
better models, more context), not to iOS/voice/TTS. If they hold up — the project has
a spine, and the iOS 14-day audio-spike timebox starts.

Also queued for you, unchanged: register **foray.fm**, and start the Apple Developer +
CarPlay entitlement application this week.
