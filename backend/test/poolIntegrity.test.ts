import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Referential integrity for the content pool — the gate the nightly refresh
 * relies on before pushing unattended (playbook step 5). Covers what
 * dataSchemaCompliance does not: discover.json and item-tags.json.
 */

const dataDir = join(__dirname, "..", "..", "data");
const discover = JSON.parse(readFileSync(join(dataDir, "discover.json"), "utf8"));
const session = JSON.parse(readFileSync(join(dataDir, "session.json"), "utf8"));
const tags = JSON.parse(readFileSync(join(dataDir, "item-tags.json"), "utf8"));
const taxonomy = JSON.parse(readFileSync(join(dataDir, "taxonomy.json"), "utf8"));

const nodeIds = new Set(taxonomy.nodes.map((n: { id: string }) => n.id));

describe("discover.json integrity", () => {
  it("has no duplicate item ids", () => {
    const seen = new Set<string>();
    const dupes = discover.items.filter((i: { id: string }) => seen.has(i.id) || !seen.add(i.id) && false);
    expect(dupes.map((i: { id: string }) => i.id)).toEqual([]);
  });

  it("has no duplicate track ids (within discover or vs session)", () => {
    const seen = new Map<number, string>();
    Object.entries(session.episodes as Record<string, { apple_track_id: number | null }>).forEach(([id, e]) => {
      if (e.apple_track_id) seen.set(e.apple_track_id, id);
    });
    const dupes: string[] = [];
    for (const i of discover.items) {
      if (!i.apple_track_id) continue;
      if (seen.has(i.apple_track_id)) dupes.push(`${i.id} duplicates ${seen.get(i.apple_track_id)}`);
      else seen.set(i.apple_track_id, i.id);
    }
    expect(dupes).toEqual([]);
  });

  it("every item has the required fields", () => {
    const bad = discover.items.filter((i: Record<string, unknown>) =>
      !i.id || !i.show || !i.title || !i.apple_collection_id || !i.hook ||
      !Array.isArray(i.topics) || (i.topics as string[]).length === 0);
    expect(bad.map((i: { id?: string; title?: string }) => i.id ?? i.title)).toEqual([]);
  });

  it("every topic resolves to a taxonomy node", () => {
    const orphans = new Set<string>();
    for (const i of discover.items) {
      for (const t of i.topics || []) if (!nodeIds.has(t)) orphans.add(`${i.id}:${t}`);
    }
    expect([...orphans]).toEqual([]);
  });
});

describe("item-tags.json parity", () => {
  it("every pool item is tagged", () => {
    const untagged = [
      ...discover.items.map((i: { id: string }) => i.id),
      ...Object.keys(session.episodes),
    ].filter(id => !tags.tags[id] || !tags.tags[id].length);
    expect(untagged).toEqual([]);
  });

  it("tags are well-formed (1-12 lowercase-hyphenated per item)", () => {
    const bad: string[] = [];
    for (const [id, list] of Object.entries(tags.tags as Record<string, string[]>)) {
      if (!Array.isArray(list) || list.length < 1 || list.length > 12) { bad.push(id); continue; }
      if (list.some(t => !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(t))) bad.push(id);
    }
    expect(bad).toEqual([]);
  });
});
