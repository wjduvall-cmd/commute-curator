/* Applies data/genre-taxonomy-map.json to the breadth catalog(s), producing
   the base classification overlay. LLM refinement overlays layer on top
   (higher source precedence). See docs/CATALOG-PIPELINE.md.

   Usage: node tools/classify-breadth.mjs [--in data/catalog-breadth.json] */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const inPath = args.includes("--in") ? args[args.indexOf("--in") + 1] : "data/catalog-breadth.json";

const cat = JSON.parse(readFileSync(join(ROOT, inPath), "utf8"));
const gmap = JSON.parse(readFileSync(join(ROOT, "data", "genre-taxonomy-map.json"), "utf8")).map;
const taxonomy = new Set(JSON.parse(readFileSync(join(ROOT, "data", "taxonomy.json"), "utf8")).nodes.map(n => n.id));

const CONF_ORDER = { high: 3, medium: 2, low: 1 };
const entries = {};
let unmappedGenres = new Set();

for (const s of cat.shows) {
  const topics = new Set();
  let conf = "high";
  for (const g of [s.apple_genre, s.chart_genre_name]) {
    if (!g) continue;
    const m = gmap[g];
    if (!m) { unmappedGenres.add(g); continue; }
    m.topics.forEach(t => { if (taxonomy.has(t)) topics.add(t); });
    if (CONF_ORDER[m.confidence] < CONF_ORDER[conf]) conf = m.confidence;
  }
  if (!topics.size) continue;
  entries[s.apple_collection_id] = { topics: [...topics], confidence: conf, source: "genre-map" };
}

const doc = {
  version: 1,
  built_at: new Date().toISOString(),
  provenance: { produced_by: "classify-breadth.mjs", method: "deterministic genre map", input: inPath },
  entries,
};
const outPath = join(ROOT, "data", "breadth-classification.json");
writeFileSync(outPath, JSON.stringify(doc) + "\n");

const confCounts = {};
Object.values(entries).forEach(e => confCounts[e.confidence] = (confCounts[e.confidence] || 0) + 1);
console.log(`classified ${Object.keys(entries).length}/${cat.shows.length} shows`, confCounts);
if (unmappedGenres.size) console.warn("UNMAPPED GENRES:", [...unmappedGenres]);
