# Discover Pool Notes

Built from live `itunes.apple.com/lookup?entity=podcastEpisode` fetches for all 44 shows in
`data/catalog.json`. 108 episodes selected, none invented; all trackIds/URLs came from the API.

## Items per top-level topic branch (topics inherited from show tags; sums >108, some shows dual-tagged)
- engineering: 34, history: 33, craft: 20, comedy: 16, science: 15, business: 14

## Shows skipped
None — all 44 shows returned usable episode data on the first lookup pass, no retries needed.

## Selection notes
- 3 episodes for 20 richer/more active shows, 2 for the remaining 24 (target 90-120, landed at 108).
- Skipped trailers, ad-only clips, sub-2-min teasers (MTDCNC Instagram clips, Conan "Vs. Edibles").
- Kept sub-10-min picks only for inherently short-form shows (Engines of Our Ingenuity, MRS Bulletin).
- `bad-friends` descriptions are mostly ad-read copy; hooks there lean on title content instead.
