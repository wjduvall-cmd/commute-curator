# Nightly refresh

You are running Foray's nightly content refresh, unattended, on the owner's machine.
Work through these steps exactly; be conservative — a broken deploy at 4am is far worse
than a skipped night. Read CLAUDE.md first (copy rules and principles are binding).

1. **Scan feeds**: run `node tools/refresh-feeds.mjs`. It writes new episodes (last 48h,
   curated shows only) to `data-local/fresh-pending.json`.

2. **If zero pending episodes**: log "nothing new" to `data-local/refresh-log.txt`
   (append one line: date, result) and STOP. Do not commit anything.

3. **Enrich each pending episode**:
   - Resolve its `apple_track_id` via `https://itunes.apple.com/lookup?id=<apple_collection_id>&entity=podcastEpisode&limit=25`
     (match by title; new episodes are recent so they're in the window). Capture
     `trackViewUrl` as `apple_episode_url` and `contentAdvisoryRating` → `explicit`
     (fall back to the feed's `explicit_hint` if lookup fails; never guess clean).
   - Write a hook: ≤16 words from the episode's real description. Banned: "fascinating",
     "deep dive", "delve", "explores", clickbait withholding, commute-length framing.
   - Write 5–10 tags (lowercase-hyphenated, reuse the existing vocabulary in
     `data/item-tags.json` where it applies).
   - Item id: `<show-slug>--<short-episode-slug>` matching the show's existing id style
     in `data/discover.json`.

4. **Merge** into `data/discover.json` (append items; fields: id, show, title,
   apple_collection_id, apple_track_id, apple_episode_url, release_date, duration_min,
   artwork_url, topics, hook, explicit) and `data/item-tags.json` (tags per new id).
   Skip any id or apple_track_id that already exists anywhere in discover.json or
   data/session.json. Update both files' `built_at`.

5. **Validate**: `cd backend && npx vitest run test/copyRules.test.ts test/dataSchemaCompliance.test.ts`.
   If anything fails, fix your additions (or drop the offending episode) and re-run.
   Never commit red.

6. **Commit and push**:
   `git add data/discover.json data/item-tags.json` then commit with message
   `Nightly refresh: +N episodes (YYYY-MM-DD)` (include the Claude Code co-author
   trailer) and `git push`.

7. **Log**: append one line to `data-local/refresh-log.txt`:
   `YYYY-MM-DD HH:MM | +N episodes | shows: <comma list> | pushed <sha-short>`

Constraints: touch ONLY `data/discover.json`, `data/item-tags.json`, and files under
`data-local/`. No other file changes, no schema changes, no dependency changes. If
anything looks structurally wrong (merge conflicts, failing pull, corrupted data),
log the problem to `data-local/refresh-log.txt` and stop without committing.
Before step 6, run `git pull --rebase` to pick up any daytime commits.
