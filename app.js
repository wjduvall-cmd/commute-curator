/* CommutePilot web client v1 — renders session.json, external playback handoff. */

const state = {
  session: null,
  validated: null,          // data/validated-links.json overlay (track ids, artwork)
  swapIdx: {},              // slot -> index into [primary, ...alternates]
};

const $ = (sel, el = document) => el.querySelector(sel);

function logEvent(type, payload) {
  try {
    const events = JSON.parse(localStorage.getItem("cp_events") || "[]");
    events.push({ ts: new Date().toISOString(), type, payload });
    localStorage.setItem("cp_events", JSON.stringify(events.slice(-500)));
  } catch (_) { /* storage full or disabled — never break the page */ }
}

function episode(id) {
  const ep = state.session.episodes[id];
  if (!ep) return null;
  const v = state.validated?.episodes?.[id];
  if (v) {
    return {
      ...ep,
      apple_track_id: ep.apple_track_id ?? v.apple_track_id,
      artwork_url: v.artwork_url || ep.artwork_url || null,
      apple_episode_url: v.apple_episode_url || null,
    };
  }
  return ep;
}

function links(ep) {
  const cid = ep.apple_collection_id;
  const apple = ep.apple_episode_url
    || (ep.apple_track_id
        ? `https://podcasts.apple.com/us/podcast/id${cid}?i=${ep.apple_track_id}`
        : `https://podcasts.apple.com/us/podcast/id${cid}`);
  return {
    apple,
    overcast: `https://overcast.fm/itunes${cid}`,
    podlink: `https://pod.link/${cid}`,
  };
}

function fmtDur(min) {
  if (!min) return "";
  return min >= 60 ? `${Math.floor(min / 60)}h ${min % 60}m` : `${min} min`;
}

function playButtons(ep, ctx) {
  const l = links(ep);
  const mk = (href, label, cls) =>
    `<a class="${cls}" href="${href}" target="_blank" rel="noopener"
        data-ev="picked" data-ep="${ep._id}" data-app="${label}" data-ctx="${ctx}">${label}</a>`;
  return `<div class="btns">
    ${mk(l.apple, "Apple Podcasts", "primary")}
    ${mk(l.overcast, "Overcast", "")}
    ${mk(l.podlink, "pod.link", "")}
  </div>`;
}

function renderCard(card) {
  const chain = [card.episode_id, ...(card.alternates || [])];
  const idx = (state.swapIdx[card.slot] || 0) % chain.length;
  const ep = episode(chain[idx]);
  if (!ep) return "";
  ep._id = chain[idx];

  const isAlternate = idx !== 0;
  const why = isAlternate
    ? (ep.summary || "")
    : card.why_line;
  const fit = isAlternate
    ? `${fmtDur(ep.duration_min)} — alternate pick ${idx} of ${chain.length - 1}`
    : card.fit_line;

  return `<article class="card" data-archetype="${card.archetype}">
    <span class="chip">${card.archetype_label}</span>
    <div class="head">
      ${ep.artwork_url ? `<img class="art" src="${ep.artwork_url}" alt="" loading="lazy">` : ""}
      <div>
        <p class="show">${ep.show}</p>
        <h2>${ep.title}</h2>
      </div>
    </div>
    <p class="why">${why}</p>
    <p class="fit">${fit}</p>
    <p class="meta">${fmtDur(ep.duration_min)} · ${ep.release_date}</p>
    ${playButtons(ep, `card-${card.archetype}`)}
    ${chain.length > 1 ? `<button class="swap" data-slot="${card.slot}">show me a different ${card.archetype_label.toLowerCase()} pick</button>` : ""}
  </article>`;
}

function renderBrowse() {
  return state.session.categories.map(cat => `
    <details class="cat">
      <summary><span>${cat.label}<span class="desc">${cat.description}</span></span></summary>
      ${cat.groups.map(g => `
        ${cat.groups.length > 1 ? `<div class="group-label">${g.label}</div>` : ""}
        ${g.episode_ids.map(id => {
          const ep = episode(id);
          if (!ep) return "";
          ep._id = id;
          const l = links(ep);
          return `<div class="ep-row">
            <div class="info">
              <div class="t">${ep.title}</div>
              <div class="s">${ep.show} · ${fmtDur(ep.duration_min)}</div>
            </div>
            <a class="go" href="${l.apple}" target="_blank" rel="noopener"
               data-ev="picked" data-ep="${id}" data-app="Apple Podcasts" data-ctx="browse">Play</a>
          </div>`;
        }).join("")}
      `).join("")}
    </details>`).join("");
}

function render() {
  const s = state.session;
  $("#built-at").textContent =
    `Built ${new Date(s.built_at).toLocaleString([], { weekday: "long", hour: "numeric", minute: "2-digit" })}` +
    ` · tuned for a ${s.commute.minutes}-min drive at ${s.commute.playback_speed}×`;
  $("#cards").innerHTML = s.cards.map(renderCard).join("");
  $("#browse-body").innerHTML = renderBrowse();

  document.querySelectorAll(".swap").forEach(btn => {
    btn.addEventListener("click", () => {
      const slot = Number(btn.dataset.slot);
      state.swapIdx[slot] = (state.swapIdx[slot] || 0) + 1;
      logEvent("refreshed_slot", { slot });
      render();
    });
  });

  document.querySelectorAll("[data-ev='picked']").forEach(a => {
    a.addEventListener("click", () => {
      logEvent("picked", { episode_id: a.dataset.ep, app: a.dataset.app, context: a.dataset.ctx });
    });
  });
}

async function init() {
  try {
    const res = await fetch("data/session.json", { cache: "no-cache" });
    state.session = await res.json();
  } catch (e) {
    $("#cards").innerHTML = `<div class="error-box">Couldn't load the session. Check your connection and reload.</div>`;
    return;
  }
  try {
    const res = await fetch("data/validated-links.json", { cache: "no-cache" });
    if (res.ok) state.validated = await res.json();
  } catch (_) { /* overlay is optional */ }

  render();
  logEvent("session_shown", { session_id: state.session.session_id });

  $("#refresh-all").addEventListener("click", () => {
    state.session.cards.forEach(c => {
      if (c.alternates?.length) state.swapIdx[c.slot] = (state.swapIdx[c.slot] || 0) + 1;
    });
    logEvent("refreshed_all", {});
    render();
  });
}

init();
