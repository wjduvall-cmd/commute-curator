# Semantic index build notes (2026-07-08)

Inputs: data/discover.json (146 items) + data/session.json (27 episodes) = 173 tagged ids, zero overlap.
Outputs: data/item-tags.json, data/semantic-index.json (schemas per series-builder spec, version 1).

## Coverage stats
- Tags: 173/173 ids covered; 5-9 tags each (avg 7.3); vocabulary of 574 unique tags, all lowercase/hyphenated.
- Concepts: 70; every one of the 20 topic branches in the pool maps to >=1 concept.
- Terms: 772 unique concept terms; 398 also appear verbatim in the tag vocabulary; every concept's terms hit >=1 item tag or title (validated).
- Modifiers: 28 (duration_max/min, branch, recency_days); related links all resolve to real concept ids (validated).

## Example query walkthroughs (query word -> concept -> terms -> matches)
1. "science of bbq" -> concepts `science` + `bbq`; bbq terms (bbq, barbecue, grilling, pitmasters, steven-raichlen) hit both BBQ Central episodes; related `cooking`/`food-science` gently pulls in the Gastropod bacon/lobster episodes.
2. "quick fusion story" -> `fusion` concept (tokamak, stellarator, helion, nif...) matches the 12 session fusion episodes + discover fusion items; "quick" modifier caps duration_max 30 (cleantechies-216-thea, mtdcnc items); "story" adds branch history bias (cbc-general-fusion documentary).
3. "funny hang for tonight" -> "funny" modifier -> branch comedy; `comedy` concept terms (banter, hang, absurdist, roasting) match every Conan/SmartLess/MBMBaM/Good Hang/Bad Friends/Fly on the Wall item.
4. "rome" -> `rome` concept (ancient-rome, roman-women, fulvia, clodia, augustus, julius-caesar) matches all three Ancient History Fangirl episodes + wine-civilisation; related `greece`/`ancient-history` expands to Hardcore History Alexander and The Ancients.
5. "plane crashes" -> `plane-crashes` concept (plane-crash, ntsb, aviation-safety, black-box, icing, rudder-failure) matches both Black Box Down + both Flight Safety Detectives items; related `aviation`/`disasters` expands to Skunk Works and Chernobyl dome.

Validator: scratchpad/validate.js (coverage, tag shape, concept/related integrity, term-tag intersection, modifier schema) — PASS.
