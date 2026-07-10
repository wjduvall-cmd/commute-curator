/* Foray events endpoint — local-first (REQUIREMENTS-DELTA R2).
   Runs on the always-on workstation; the web client POSTs its event buffer
   here. Events land as append-only JSONL per profile in data-local/events/.

   Reality check, documented: the site is HTTPS, so browsers only allow this
   HTTP endpoint from the SAME machine (localhost exception). Desktop
   browsing syncs; phones keep buffering in localStorage until the
   Cloudflare upgrade gives us an HTTPS endpoint. Nothing is lost either
   way — the client tracks what's been synced.

   Usage: node tools/events-server.mjs   (port 8787)                        */

import { createServer } from "node:http";
import { appendFileSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIR = join(ROOT, "data-local", "events");
mkdirSync(DIR, { recursive: true });

const PORT = 8787;
const ALLOWED_ORIGINS = new Set([
  "https://wjduvall-cmd.github.io",
  "http://localhost:8080",
]);

function cors(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }
}

const server = createServer((req, res) => {
  cors(req, res);
  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }

  if (req.method === "POST" && req.url === "/events") {
    let body = "";
    req.on("data", c => { body += c; if (body.length > 2e6) req.destroy(); });
    req.on("end", () => {
      try {
        const { profile, events } = JSON.parse(body);
        if (!profile || !Array.isArray(events)) throw new Error("bad shape");
        const safe = String(profile).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40) || "unknown";
        const lines = events.slice(0, 1000).map(e => JSON.stringify(e)).join("\n");
        if (lines) appendFileSync(join(DIR, safe + ".jsonl"), lines + "\n");
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ accepted: events.length }));
      } catch (e) {
        res.writeHead(400); res.end("bad request");
      }
    });
    return;
  }

  if (req.method === "GET" && req.url === "/stats") {
    const files = readdirSync(DIR).filter(f => f.endsWith(".jsonl"));
    const stats = files.map(f => ({ profile: f.replace(".jsonl", ""), bytes: statSync(join(DIR, f)).size }));
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ profiles: stats }));
    return;
  }

  res.writeHead(404); res.end();
});

server.listen(PORT, () => console.log(`Foray events server on http://127.0.0.1:${PORT} -> ${DIR}`));
