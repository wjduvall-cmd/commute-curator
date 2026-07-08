# 07 — Pre-mortem: Why Foray Died

**Red-team desk · written as if from July 2027, twelve months out.**

Premise: the repo's last real commit was March 2027. The creator still listens to podcasts every commute — in Overcast. This memo reconstructs how that happened, ranks the causes by probability × damage, and names the tripwires that could have caught each one a season earlier. No comfort blanket is offered; the roadmap itself says the funding gate is the creator's own week-8 retention (06_ROADMAP.md, M7), so this document takes that gate as the thing that failed.

**The one-paragraph obituary.** Foray died the way solo hobby products die: not from a competitor, but from the gap between a magical hand-made demo and a mediocre automated pipeline, crossed at the exact moment the hardest engineering (iOS audio) was still ahead. The July 2026 web menu felt like a sharp friend because a frontier model with an agent research budget *was* the sharp friend, once. The machine that was supposed to reproduce that daily at <$5/week never matched it, the creator's picks drifted back to his three usual shows, the why-lines faded into wallpaper, and by the time the iOS app could have made the habit frictionless there was no longer a habit to make frictionless. Every one of these failure modes was visible in the repo in week one.

---

## Ranked causes (probability × damage)

| # | Cause | P | Damage | P×D notes |
|---|---|---|---|---|
| 1 | Creator retention fails before M5 — the gate kills its own project | 0.65 | Fatal | The named funding gate; everything below feeds it |
| 2 | The hand-curation false positive: automated pipeline regresses to generic | 0.60 | Fatal via #1 | Session 1 was literally curated by the architect model |
| 3 | The iOS audio gauntlet (M0/M3) never gets finished | 0.55 | Fatal via #1 | Highest-effort milestone, solo dev, Windows-first environment |
| 4 | Why-line habituation: the soul of the product becomes slop | 0.50 | Severe | Template already visible in session 1 |
| 5 | Signal sparsity: the learning loop never beats a static menu | 0.70 | Moderate-severe | Near-certain to occur; damage capped only if accepted early |
| 6 | Cost ceiling forces metadata-only curation → generic menus | 0.45 | Severe (amplifies #2) | $5/week vs transcript-grade why-lines |
| 7 | Spotify/synthetic audio makes the niche feel pointless | 0.35 | Moderate (kills motivation, not product) | A demoralizer, not a defeater |

**The kill chain, compressed:** #2 and #6 degrade menu quality → #4 makes the degradation audible twice a day → #1 (the creator quietly stops picking) → #3 means there is no frictionless native app to rescue the habit → #7 converts the stall into permanent abandonment. No single cause has to finish the job; they compound.

---

### 1. The creator stops reaching for it (the gate closes)

**The load-bearing assumption:** "if *I* still reach for it after 8+ weeks, it has a pulse." This assumes the creator behaves like a user. He doesn't — he behaves like a builder. Builders open their product to check whether last night's change worked, which masquerades as retention for months and then evaporates the week the tinkering stops.

**How it plays out, month by month:**
- **Jul 2026** — daily opens, but they're QA opens. The DECISIONS log shows the product was redesigned after *one* morning of real use. Genuine picks and builder curiosity are indistinguishable in the data (and the data is localStorage, so there is no data).
- **Aug 2026** — the novelty of the fusion-tour catalog is exhausted; it's a static ~30-episode list and he's heard the good ones. Opens drop to "when I remember."
- **Sep 2026** — picks collapse toward the Comfort card or nothing: the exact "3 usual shows + 1 random thing" failure the curation spec names as death on its first line.
- **Oct 2026** — the web page is a bookmark he doesn't tap. Overcast never left the dock, because Foray's own playback handoff *lands him in Overcast every time* — the product trained him to keep the old app warm.
- **Week 8** — the honest answer to the gate question is "no." Since the creator is also the judge, the question simply stops being asked, which is indistinguishable from passing.

**Already-visible warning sign (in the repo today):** the 2026-07-08 DECISIONS entry. Day-one feedback replaced the four-archetype menu — the entire curation thesis — with a "splatter" shuffle feed with a 30% wildcard floor. That is the founding user voting, with his first morning of use, for *browse* over *curated commitment*. If the archetype menu doesn't survive contact with its own designer for 24 hours, the "sharp friend who picks four things" framing is already in trouble.

**Cheapest tripwire:** durable usage logging with a streak alert, installed now (Tripwire 1 below). The current instrumentation — localStorage, capped at 500 events, never synced, fragmented per browser — is structurally incapable of answering the only question the roadmap says matters.

### 2. The web test is a false positive: frontier hand-curation doesn't scale down

**The load-bearing assumption:** the automated M1/M2 pipeline can reproduce the week-one menu quality nightly, unattended, on a hobby budget.

**How it plays out:**
- **Jul 2026** — session 1's menu is assembled by Claude at build time from agent-researched candidates verified one-by-one against the iTunes API (DECISIONS, 2026-07-07). That is human-grade editorial labor: finding the *one* SPARC-co-founder episode, writing "ancient smiths solved carbon control completely blind" as a stretch-bridge. The menu feels telepathic because tens of dollars of frontier compute and a research agenda went into 4 cards.
- **Aug 2026** — the first machine-built menus arrive from Tier-0/Tier-1 metadata classification. They're... fine. Relevant shows, plausible episodes, correct archetypes — and utterly missing the specific insight that made week one magical.
- **Sep 2026** — three weekends of prompt tuning, each closing ~10% of a gap whose last 50% requires transcript-level understanding the budget forbids. The comparison the creator runs in his head every morning isn't machine-vs-nothing; it's machine-vs-the-memory-of-week-one. The machine loses daily.
- **Oct 2026** — "the menus got worse" becomes the ambient explanation for declining use, and it's correct.

**Earliest warning sign:** the first machine-built menu where the creator picks an *alternate* or nothing rather than a lead card. Second sign: why-lines that could have been written from the episode title alone.

**Cheapest tripwire:** blind parity testing from the first day the builder runs — interleave one hand-curated (or frontier-max-budget) menu per week among machine menus, unlabeled, and log which kind wins the pick. If hand beats machine >70% after ten sessions, the core promise doesn't survive automation at this budget. That is an architecture/pricing decision, not a prompt-tuning task, and it deserves to be forced early.

### 3. The iOS gauntlet: M0 and M3 are where solo projects go to die

**The load-bearing assumption:** a solo dev finishes the audio-engineering milestone the brief itself flags as "the highest-polish-risk area."

**How it plays out:**
- **Sep 2026** — the M0 audio spike ("≤ a day" per roadmap) meets AVAudioSession reality: hold-to-talk ducking, phone-call interruption recovery, Bluetooth route changes when the car turns off. The day becomes a week. Note also the environment friction: primary development happens on a Windows machine; every iOS iteration is a context-switch to a Mac, a device build, and a *car test*.
- **Oct 2026** — it works except when a phone call arrives. M3's acceptance bar — five real commutes, zero glitches, zero lost positions, airplane-mode cold launch, skip-to-audible <1s — is a bar that commercial podcast apps with teams miss (the personas memo cites crash-loop reviews of Apple's own client).
- **Nov 2026** — the backend is more fun, so the backend gets worked on. iOS becomes the project's permanent "next month."
- **2027** — without the native app the product is "open a website, then hand off to another app": friction that guarantees cause #1. The web pivot was framed as re-sequencing; in hindsight it was the project routing around its hardest problem, and the hardest problem never got un-routed.

**Earliest warning sign:** the three M0 spikes (each spec'd at ≤1 day) not all complete within two weeks of iOS work starting.

**Cheapest tripwire:** a calendar, not code. Timebox the M0 spikes to 14 elapsed days from their start date, fallback pre-written: blow the box and Foray is officially a PWA + handoff product, with everything downstream re-scoped that day. An honest small product beats a fictional ambitious one.

### 4. The why-line becomes wallpaper, then slop

**The load-bearing assumption:** a per-pick spoken/written explanation stays delightful under daily repetition.

**How it plays out:**
- The why-line is the product's soul and its most repeated element: two per commute, ten per week, ~90 by the week-8 gate. Session 1 already reveals the template: "You liked/care about X — Y scratches the same itch."
- **Week 3** — the creator can predict the line before reading it. **Week 5** — it's skipped like a cookie banner. **Week 7** — a subtly *wrong* one ("your fusion-reactor tour" weeks after he abandoned that tour, because taste-state went stale) actively reads as slop.
- The personas memo is explicit that in the 2026 AI-fatigue climate a boilerplate-feeling AI explanation is *worse than none*. Habituation isn't a quality failure; it's arithmetic — a fixed rhetorical structure delivered daily becomes invisible regardless of how good each instance is.
- The spoken version is worse: 20 seconds of TTS standing between you and the episode, every time, at 7:40am. The Penn State finding in 04-personas (explanation is wanted in proportion to how surprising the pick is) says most intros should already be near-silent; the spec defers that "auto-brief" behavior to M5, four milestones too late.

**Earliest warning sign:** the creator tapping play before the intro finishes, or render-to-pick time shrinking below reading time (measurable now).

**Cheapest tripwire:** log time-to-pick per card; embed every generated why-line and alert when cosine similarity to any line in the trailing 30 days exceeds ~0.9; hard-rotate rhetorical forms in generation (ban the "same itch" construction after N uses); ship auto-brief immediately, not in M5.

### 5. Signal sparsity: the learning loop is statistically stillborn

**The load-bearing assumption:** 1 user × ~1 pick/day generates enough signal for the ranker to demonstrably beat a static menu.

**How it plays out:**
- The arithmetic: ~5–10 durable signals/week at best. The web phase collects *less* — external handoff makes completion, the strongest signal in the spec's own table, invisible. Hence the "Done ✓" button, which the creator (by his own stated principle that state is observed, never declared) taps for two weeks and then never again.
- M5's acceptance test — held-out-week replay where the ranker beats a recency baseline "on my actual picks" — is a comparison over roughly seven picks. Seven Bernoulli trials cannot distinguish a good ranker from a coin flip, let alone from a decent static menu.
- The competitive memo already called sparsity "the top remaining threat"; the twist is that at n=1 it isn't a threat, it's a ceiling. The learning loop was never going to demonstrably outperform the creator spending ten minutes a month hand-editing his interest weights — an inspectable-taxonomy feature the spec requires anyway.

**Earliest warning sign:** week-4 signal ledger under 5 durable taste events/week; interest weights essentially unmoved since seeding.

**Cheapest tripwire:** count signals weekly and confront the number. Below ~10/week at week 4, execute a pre-agreed descope: M5 becomes "hand-editable interests + fatigue rules + fresh-content plumbing" — 80% of the felt value at 20% of the effort — and the unpassable "beat the baseline" gate leaves the critical path. Write the descope into DECISIONS.md now so future-you can't renegotiate it while demoralized.

### 6. The cost ceiling and the quality floor meet in the middle, badly

**The load-bearing assumption:** excellent curation exists inside the budget envelope ($5/week now; ~$10–15/user/*year* price ceiling per the Overcast evidence later).

**How it plays out:** cause #2 shows the felt quality of week one came from deep, transcript-aware, agent-researched curation. Metadata-only Tier-1 classification produces exactly the "relevance sort" the brief forbids. The cheap-first cascade is correct engineering; the unexamined question is whether the quality the creator fell in love with exists *anywhere* inside the envelope — and 2026-era evidence says episode-level editorial insight lives in transcripts, which cost real money. The project dies with the contradiction unexamined: hobby-budget menus aren't worth keeping, and menus worth keeping imply unit economics no consumer price point funds.

**Earliest warning sign:** cost_events showing the weekly budget exhausted on Tier-1 passes alone, with shortlisted episodes never earning transcription.

**Cheapest tripwire:** one deliberately *unconstrained* build per week (frontier model, transcripts, no cap) alongside the budget builds, blind-tested per Tripwire 2. Measure the quality-per-dollar curve directly instead of discovering it by churn.

### 7. Spotify's 2026 AI stack makes the niche feel pointless

**Lowest-ranked, deliberately.** Prompted Playlists with podcasts (Apr 2026), AI briefings (May 2026), DJ at 94M users — by winter the feature-checklist gap is embarrassing, and every hands-on article about Spotify's commute AI drains founder morale. But the competitive memo's analysis holds: Spotify's recommender is a marketplace instrument that ignores "not interested"; it structurally cannot do aligned, explained, episode-level curation, and Apple has left the Scout FM hole open for six years. Spotify doesn't kill Foray's use case. What it kills, in the creator's head during month 5, is the fantasy that finishing M7 leads anywhere — and for a motivation-fueled solo project, killing the dream kills the commits. This cause never acts alone; it converts the stall from causes 1–3 into permanent abandonment.

**Earliest warning sign:** roadmap discussion shifting from "what does M3 need" to "is this even worth it" — a DECISIONS.md smell, not a metric.

**Cheapest tripwire:** the quarterly watchlist in 01-competitive-landscape.md §6, with a standing rule attached: a competitor shipping features changes *nothing* unless it hits a named trigger (Spotify honoring negative feedback; Apple shipping a personalized drive mode). Decide the re-assessment criteria now, while calm, so a demo video in November can't do it.

---

## The 5 tripwires to install now

1. **Durable retention telemetry + streak alert.** Tonight: sync the localStorage event buffer anywhere durable (backend table, or a dumb append-only endpoint). Log `session_shown`, `picked`, and `pick_source` (lead / alternate / splatter / none). Alert when 3 consecutive weekdays pass with zero picks; review 7-day pick-rate every Sunday. This is the M7 gate made measurable — right now it is unmeasurable by construction.
2. **Blind hand-vs-machine parity test.** From the session builder's first real run, interleave one frontier/hand-grade menu per week, unlabeled, `builder_id` logged against picks. Alert if machine menus' lead-card pick-rate falls below half of hand menus' over 10 sessions. Tests causes #2 and #6 simultaneously.
3. **Why-line freshness monitor.** Log render-to-pick time per card; embed every generated why-line; alert on >0.9 similarity to any line in the trailing 30 days or 3+ uses of the same rhetorical frame in a week. Ship the auto-brief rule immediately, not in M5.
4. **Weekly signal ledger with a pre-committed descope.** Count durable taste signals per the spec's table. If <10/week at week 4, M5 formally becomes "editable interests + fatigue rules," not "ranker beats baseline." Record the trigger in DECISIONS.md now.
5. **M0 hard timebox.** The three risk-retirement spikes get 14 elapsed days from the day iOS work starts, on the calendar, fallback pre-written: blow the box and Foray is officially a PWA + handoff product, with all iOS-dependent roadmap items re-scoped that day.

## The single assumption most worth testing in the next 2 weeks

**That the automated pipeline — real session builder, real budget, no architect-in-the-loop — produces menus the creator actually picks from.** Everything else is downstream of this. Concretely: get the backend builder generating 7 consecutive daily menus (iTunes API sufficed for session 1; Podcast Index dry-run is fine), serve them to the web client with no hand-editing allowed, and run M2's honesty gate against *those* menus — with two hand-curated menus blind-interleaved as the control. If the machine menus pass, the project has a spine and the iOS grind is worth it. If they don't, that is the finding of the year, learned in July instead of November — and the next dollar goes to curation depth, not to iOS, voice, TTS, or another marketing memo.

## What to do LESS of

Strategy and surface. This repo contains six polished marketing documents — competitive landscape, market sizing, positioning and pricing, personas, a legal risk memo, a naming study — for a product with one user, a static hand-built JSON menu, and zero automated curation runs. It also contains a web client already on its third feature iteration (splatter feeds, star boosts, chain rotation, exclusion windows), tuning the browse experience of a discovery surface whose core claim is that you *shouldn't have to browse*. Both are pleasant, legible work that produces the feeling of progress while the two things that will actually decide life or death — the automated builder's menu quality and the iOS audio spike — sit untested. The marketing corpus is done; freeze it until there is a retention curve for it to describe. The web client is good enough; every additional hour of splatter-tuning is an hour spent decorating the waiting room of a clinic with no doctor. The failure risks are all upstream, in the pipeline and the car. Spend there.
