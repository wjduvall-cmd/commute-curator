# Genre → Taxonomy Map Notes

Built 2026-07-09 (`data/genre-taxonomy-map.json`). Source: `data/catalog-breadth.json` (19,787 shows).

## Counts
- 110 distinct genres (apple_genre and chart_genre_name share the identical 110-value vocabulary; one map covers both).
- 110 map entries; confidence: 79 high / 23 medium / 8 low.
- 67 new nodes: 12 new branches (news, true-crime, religion, kids-family, fiction, tv-film, health, education, personal-journals, relationships, hobbies, travel) + 55 subtopics.

## Judgment calls
- Sports got 12 new sport-specific subtopics (soccer...fantasy) so "Baseball" etc. can be high-confidence; Swimming/Running reuse existing `sports/endurance` (+`health/fitness`) rather than new nodes.
- "Tech News" → new `news/tech` + `computing` (news framing dominates over engineering).
- Cross-branch news genres map to branch pairs: Business News → news+business, Sports News → sports+news, Entertainment News → tv-film+news.
- "Improv" reuses `comedy/casual-hangs` (its existing apple_anchor is Comedy > Improv); Stand-Up and Comedy Interviews got new comedy subtopics.
- "Comedy Fiction" and "Film History"/"Music History" double-map into both relevant branches.
- "Life Sciences" → medicine/biology + science + nature; "Wilderness" → adventure/exploration + nature; "Nutrition" → health/nutrition + food; "Language Learning" → education/language-learning + linguistics/language.
- "Pets & Animals" placed under nature (content affinity) despite Apple filing it under Kids & Family.
- Arts subgenres landed under the existing `culture` branch (books, design, fashion, performing-arts) instead of a new arts branch.
- "Government" → new `society/government` + news/politics (medium); "Non-Profit" → new `business/non-profit` + society (medium).
- "Technology" umbrella → computing + engineering (medium): the catalog mixes gadget shows with software/AI shows.
- Exact-branch umbrellas (Comedy, Sports, Music, Business, News, Fiction, TV & Film, Kids & Family, Health & Fitness, Religion & Spirituality, History, Science, Arts) are medium: branch is certain, subtopic needs per-show refinement.

## Low-confidence (queued for LLM per-show refinement)
Society & Culture, Documentary, Personal Journals, Education, Courses, How To, Leisure, Hobbies — all are topic-agnostic umbrellas or formats where the genre says nothing about subject matter.
