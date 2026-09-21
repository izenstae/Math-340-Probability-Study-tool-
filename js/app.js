/* ============================================================
 * App shell — routing, dashboard, schedule, reference, progress.
 * ============================================================ */
const App = (() => {
  const view = document.getElementById("view");
  const titleEl = document.getElementById("topbarTitle");
  const weekEl = document.getElementById("topbarWeek");

  /* ---------- KaTeX ---------- */
  function typeset(el) {
    if (window.renderMathInElement) {
      try {
        renderMathInElement(el, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "\\(", right: "\\)", display: false },
            { left: "\\[", right: "\\]", display: true },
          ],
          throwOnError: false,
        });
      } catch (e) { /* keep raw TeX visible rather than crash */ }
    }
  }

  /* ---------- helpers ---------- */
  function fmtDate(iso) {
    const d = new Date(iso + "T12:00:00");
    return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  }
  function daysUntil(iso) {
    const d = new Date(iso + "T23:59:59");
    return Math.ceil((d - new Date()) / (24 * 3600 * 1000));
  }
  function weekLabel() {
    const wk = MATH340.currentWeek();
    if (wk <= 0) return "Term starts " + fmtDate(MATH340.course.termStart);
    if (wk >= 11) return "Term complete";
    const row = MATH340.schedule.find(r => r.week === wk);
    return `Week ${wk} · ${row ? row.topic : ""}`;
  }

  /* ---------- Dashboard ---------- */
  function dashboard(el) {
    const wk = MATH340.currentWeek();
    const decks = MATH340.units.filter(u => u.flashcards && u.flashcards.length);
    const gens = MATH340.units.flatMap(u => u.generators || []);

    let dueTotal = 0, masteredTotal = 0, cardTotal = 0;
    for (const u of decks) {
      const s = Store.deckStats(u.flashcards);
      dueTotal += s.due; masteredTotal += s.mastered; cardTotal += s.total;
    }
    const ps = Store.practiceStats(gens);
    const upcoming = MATH340.keyDates.filter(k => daysUntil(k.date) >= 0).slice(0, 3);

    let unitCards = "";
    for (const u of MATH340.units) {
      if (!u.flashcards || !u.flashcards.length) continue;
      const s = Store.deckStats(u.flashcards);
      const pStats = Store.practiceStats(u.generators || []);
      unitCards += `
        <div class="card" style="margin-bottom:0;">
          <div style="display:flex; justify-content:space-between; align-items:baseline; gap:8px;">
            <h3 style="margin:0; font-size:15.5px;">${u.title}</h3>
            <span class="pill ${wk >= (u.week || 1) ? "pill-accent" : ""}">Week ${u.week}${wk < (u.week || 1) ? " · upcoming" : ""}</span>
          </div>
          <p class="muted" style="margin:8px 0 12px;">${u.description || ""}</p>
          <div class="progress-bar"><div style="width:${Math.round(s.mastery * 100)}%"></div></div>
          <div class="muted" style="margin-top:6px; display:flex; justify-content:space-between;">
            <span>${Math.round(s.mastery * 100)}% card mastery</span>
            <span>${pStats.attempts ? Math.round(100 * (pStats.accuracy || 0)) + "% practice acc." : "no practice yet"}</span>
          </div>
          <div style="display:flex; gap:8px; margin-top:14px;">
            <a class="btn btn-sm btn-ghost" href="#/flashcards">Cards</a>
            ${(u.generators && u.generators.length) ? `<a class="btn btn-sm btn-ghost" href="#/practice">Practice</a>` : ""}
            ${u.referenceTable ? `<a class="btn btn-sm btn-ghost" href="#/reference">Table</a>` : ""}
          </div>
        </div>`;
    }

    el.innerHTML = `
      <div class="card" style="background: linear-gradient(120deg, var(--accent-soft), var(--surface)); border-color: var(--accent-soft);">
        <h2 style="margin-bottom:2px;">${greeting()}</h2>
        <p class="muted" style="margin: 4px 0 0;">${weekLabel()} — ${dueTotal > 0
          ? `you have <b>${dueTotal}</b> flashcard${dueTotal === 1 ? "" : "s"} ready to review.`
          : "all caught up on reviews. Nice."}</p>
        <div style="display:flex; gap:10px; margin-top:16px; flex-wrap:wrap;">
          <a class="btn" href="#/flashcards">Review flashcards</a>
          <a class="btn btn-ghost" href="#/practice">Generate practice problems</a>
        </div>
      </div>

      <div class="grid-4">
        <div class="card stat" style="margin-bottom:0"><div class="num">${Store.streak()}</div><div class="lbl">day streak</div></div>
        <div class="card stat" style="margin-bottom:0"><div class="num">${masteredTotal}<span class="muted" style="font-size:15px">/${cardTotal}</span></div><div class="lbl">cards mastered</div></div>
        <div class="card stat" style="margin-bottom:0"><div class="num">${ps.attempts}</div><div class="lbl">problems attempted</div></div>
        <div class="card stat" style="margin-bottom:0"><div class="num">${ps.attempts ? Math.round(100 * ps.accuracy) + "%" : "—"}</div><div class="lbl">practice accuracy</div></div>
      </div>

      <div class="grid-2" style="margin-top:18px;">
        ${unitCards}
      </div>

      <div class="card" style="margin-top:18px;">
        <h3 style="margin-top:0;">Coming up</h3>
        ${upcoming.length ? upcoming.map(k => `
          <div class="topic-row">
            <span class="pill ${k.kind === "exam" ? "pill-red" : k.kind === "hw" ? "pill-amber" : ""}">${fmtDate(k.date)}</span>
            <div style="flex:1;">${k.label}</div>
            <span class="muted">${daysUntil(k.date) === 0 ? "today" : "in " + daysUntil(k.date) + " day" + (daysUntil(k.date) === 1 ? "" : "s")}</span>
          </div>`).join("") : `<p class="muted">No upcoming dates on record.</p>`}
        <p class="muted" style="margin-bottom:0;">Quizzes are given most Wednesdays and cover the previous week's classes and homework — see the <a href="#/schedule">schedule</a>.</p>
      </div>`;
    typeset(el);
  }

  function greeting() {
    const h = new Date().getHours();
    const g = h < 5 ? "Late-night session" : h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
    return g + " 👋";
  }

  /* ---------- Schedule ---------- */
  function schedule(el) {
    const wk = MATH340.currentWeek();
    const rows = MATH340.schedule.map(r => `
      <tr class="${r.week === wk ? "current-week" : ""}">
        <td><span class="week-badge">Week ${r.week}</span>${r.week === wk ? ` <span class="pill pill-accent">now</span>` : ""}</td>
        <td>${r.topic}</td>
        <td>${r.quiz ? `<span class="pill pill-amber">Quiz Wed</span>` : ""}</td>
      </tr>`).join("");

    el.innerHTML = `
      <div class="card">
        <h2>Course Schedule</h2>
        <p class="muted">${MATH340.course.code} · ${MATH340.course.term} · ${MATH340.course.instructor} — MWF 1:50–3:00 pm. Tentative; chapters refer to ${MATH340.course.textbook}.</p>
        <table class="tbl">
          <tr><th>Week</th><th>Topics</th><th></th></tr>
          ${rows}
        </table>
      </div>

      <div class="grid-2">
        <div class="card" style="margin-bottom:0;">
          <h3 style="margin-top:0;">Key dates</h3>
          ${MATH340.keyDates.map(k => `
            <div class="topic-row">
              <span class="pill ${k.kind === "exam" ? "pill-red" : k.kind === "hw" ? "pill-amber" : ""}">${fmtDate(k.date)}</span>
              <div style="flex:1;">${k.label}</div>
            </div>`).join("")}
        </div>
        <div class="card" style="margin-bottom:0;">
          <h3 style="margin-top:0;">Grade weighting</h3>
          ${MATH340.gradeWeights.map(g => `
            <div style="display:flex; align-items:center; gap:10px; margin:9px 0;">
              <div style="width:110px; font-size:13.5px;">${g.name}</div>
              <div class="progress-bar" style="flex:1;"><div style="width:${g.pct * 3}%"></div></div>
              <div style="width:38px; text-align:right; font-size:13px;" class="muted">${g.pct}%</div>
            </div>`).join("")}
          <p class="muted" style="margin-bottom:0;">Lowest quiz and lowest homework are dropped. Midterm allows one 8.5×11" formula sheet — build it from your <a href="#/reference">reference page</a>.</p>
        </div>
      </div>`;
    typeset(el);
  }

  /* ---------- Reference ---------- */
  function reference(el) {
    let html = "";

    // identity sheets per chapter (rendered from flashcards' backs)
    for (const u of MATH340.units) {
      if (u.referenceTable) continue;
      if (!u.flashcards || !u.flashcards.length) continue;
      html += `
        <div class="card">
          <h2>${u.title}</h2>
          <p class="muted">${u.description || ""}</p>
          ${u.flashcards.map(c => `
            <div class="ident-item">
              <div class="ident-name">${c.tag ? `<span class="pill" style="margin-right:8px">${c.tag}</span>` : ""}${c.front}</div>
              <div class="ident-formula">${c.back}</div>
            </div>`).join("")}
        </div>`;
    }

    // distribution table
    for (const u of MATH340.units) {
      if (!u.referenceTable) continue;
      html += `<div class="card"><h2>${u.title}</h2><p class="muted">${u.description}</p></div>`;
      for (const d of u.referenceTable) {
        html += `
          <div class="card dist-card">
            <div class="dist-head">
              <h3>${d.name}</h3>
              <span class="muted">\\(${d.params}\\)</span>
              <span class="pill ${d.type === "discrete" ? "pill-accent" : "pill-green"}">${d.type}</span>
            </div>
            <p class="muted" style="margin: 8px 0 4px;">${d.story}</p>
            <div class="dist-body">
              <table class="tbl">
                <tr><th style="width:130px">Support</th><td>\\(${d.support}\\)</td></tr>
                <tr><th>${d.type === "discrete" ? "PMF" : "PDF"}</th><td>\\(${d.pmf}\\)</td></tr>
                <tr><th>Mean</th><td>\\(${d.mean}\\)</td></tr>
                <tr><th>Variance</th><td>\\(${d.variance}\\)</td></tr>
                <tr><th>MGF</th><td>\\(${d.mgf}\\)</td></tr>
              </table>
            </div>
          </div>`;
      }
    }

    el.innerHTML = html || `<div class="empty-state"><div class="big">Σ</div>No reference material registered yet.</div>`;
    typeset(el);
  }

  /* ---------- Progress ---------- */
  function progress(el) {
    const decks = MATH340.units.filter(u => u.flashcards && u.flashcards.length);
    let deckRows = "";
    for (const u of decks) {
      const s = Store.deckStats(u.flashcards);
      deckRows += `
        <div class="deck-row">
          <div class="deck-info">
            <div class="deck-name">${u.title}</div>
            <div class="deck-meta">${s.started}/${s.total} cards started · ${s.mastered} mastered (box 4+)</div>
          </div>
          <div class="deck-bar">
            <div class="progress-bar green"><div style="width:${Math.round(s.mastery * 100)}%"></div></div>
            <div class="muted" style="text-align:right; margin-top:3px">${Math.round(s.mastery * 100)}%</div>
          </div>
        </div>`;
    }

    let topicRows = "";
    for (const u of MATH340.units) {
      for (const g of (u.generators || [])) {
        const p = Store.getPractice(g.id);
        if (!p.attempts) continue;
        const acc = Math.round(100 * p.correct / p.attempts);
        const recentAcc = p.recent.length ? Math.round(100 * p.recent.reduce((a, b) => a + b, 0) / p.recent.length) : null;
        topicRows += `
          <tr>
            <td>${g.name}<div class="muted" style="font-size:12px">${u.short || u.title}</div></td>
            <td>${p.correct}/${p.attempts}</td>
            <td>${acc}%</td>
            <td>${recentAcc == null ? "—" : recentAcc + "%"} ${recentAcc != null && recentAcc >= 80 ? `<span class="pill pill-green">solid</span>` : recentAcc != null && recentAcc < 50 ? `<span class="pill pill-red">review</span>` : ""}</td>
          </tr>`;
      }
    }

    // last 14 days of activity
    const act = Store.activity();
    let actCells = "";
    for (let i = 13; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const k = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
      const n = act[k] || 0;
      const level = n === 0 ? "var(--surface-2)" : n < 10 ? "color-mix(in srgb, var(--accent) 35%, var(--surface-2))" : n < 30 ? "color-mix(in srgb, var(--accent) 65%, var(--surface-2))" : "var(--accent)";
      actCells += `<div title="${k}: ${n} reviews" style="width:22px;height:22px;border-radius:5px;background:${level}"></div>`;
    }

    el.innerHTML = `
      <div class="grid-3">
        <div class="card stat" style="margin-bottom:0"><div class="num">${Store.streak()}</div><div class="lbl">day streak</div></div>
        <div class="card stat" style="margin-bottom:0"><div class="num">${Store.totalReviews()}</div><div class="lbl">total reviews & problems</div></div>
        <div class="card stat" style="margin-bottom:0"><div class="num">${MATH340.units.filter(u => u.flashcards && u.flashcards.length).length}</div><div class="lbl">units loaded</div></div>
      </div>

      <div class="card" style="margin-top:18px;">
        <h3 style="margin-top:0;">Last 14 days</h3>
        <div style="display:flex; gap:5px; flex-wrap:wrap;">${actCells}</div>
      </div>

      <div class="card">
        <h3 style="margin-top:0;">Flashcard mastery by unit</h3>
        ${deckRows}
      </div>

      <div class="card">
        <h3 style="margin-top:0;">Practice accuracy by topic</h3>
        ${topicRows ? `<table class="tbl"><tr><th>Topic</th><th>Correct</th><th>Overall</th><th>Last 10</th></tr>${topicRows}</table>`
          : `<p class="muted">No practice attempts yet — head to <a href="#/practice">Practice</a> to get started.</p>`}
      </div>

      <div class="card">
        <h3 style="margin-top:0;">Backup</h3>
        <p class="muted">Progress lives in this browser (localStorage). Export it to move between devices, or if you clear browser data.</p>
        <div style="display:flex; gap:10px; flex-wrap:wrap;">
          <button class="btn btn-ghost btn-sm" id="expBtn">Export progress</button>
          <button class="btn btn-ghost btn-sm" id="impBtn">Import progress</button>
          <button class="btn btn-ghost btn-sm" id="rstBtn" style="color:var(--red)">Reset all progress</button>
          <input type="file" id="impFile" accept="application/json" style="display:none">
        </div>
      </div>`;

    el.querySelector("#expBtn").addEventListener("click", () => {
      const blob = new Blob([Store.exportJSON()], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "math340-progress.json";
      a.click();
      URL.revokeObjectURL(a.href);
    });
    const impFile = el.querySelector("#impFile");
    el.querySelector("#impBtn").addEventListener("click", () => impFile.click());
    impFile.addEventListener("change", () => {
      const f = impFile.files[0];
      if (!f) return;
      f.text().then(t => {
        try { Store.importJSON(t); progress(el); }
        catch (e) { alert("Could not import: " + e.message); }
      });
    });
    el.querySelector("#rstBtn").addEventListener("click", () => {
      if (confirm("Reset ALL flashcard and practice progress? This cannot be undone.")) {
        Store.reset(); progress(el);
      }
    });
    typeset(el);
  }

  /* ---------- Router ---------- */
  const routes = {
    dashboard: { title: "Dashboard", mount: dashboard },
    flashcards: { title: "Flashcards", mount: el => Flashcards.mount(el) },
    practice: { title: "Practice", mount: el => Practice.mount(el) },
    reference: { title: "Reference", mount: reference },
    schedule: { title: "Schedule", mount: schedule },
    progress: { title: "Progress", mount: progress },
  };

  function route() {
    const hash = (location.hash || "#/dashboard").replace(/^#\//, "");
    const r = routes[hash] || routes.dashboard;
    titleEl.textContent = r.title;
    weekEl.textContent = weekLabel();
    document.querySelectorAll(".nav a").forEach(a =>
      a.classList.toggle("active", a.dataset.route === (routes[hash] ? hash : "dashboard")));
    view.scrollTop = 0;
    window.scrollTo(0, 0);
    r.mount(view);
    document.getElementById("sidebar").classList.remove("open");
  }

  /* ---------- Theme ---------- */
  function applyTheme(t) {
    if (t === "dark") document.documentElement.setAttribute("data-theme", "dark");
    else if (t === "light") document.documentElement.removeAttribute("data-theme");
    else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches)
      document.documentElement.setAttribute("data-theme", "dark");
  }

  /* ---------- init ---------- */
  window.addEventListener("hashchange", route);
  window.addEventListener("DOMContentLoaded", () => {
    applyTheme(Store.getTheme());
    document.getElementById("themeToggle").addEventListener("click", () => {
      const dark = document.documentElement.getAttribute("data-theme") === "dark";
      const next = dark ? "light" : "dark";
      Store.setTheme(next);
      applyTheme(next);
    });
    document.getElementById("hamburger").addEventListener("click", () =>
      document.getElementById("sidebar").classList.toggle("open"));
    document.addEventListener("keydown", e => {
      if ((location.hash || "").startsWith("#/flashcards") && !e.target.matches("input, textarea")) {
        Flashcards.onKey(e, view);
      }
    });
    route();
  });
  // KaTeX loads with defer; re-typeset once it is ready in case the first view rendered before it.
  window.addEventListener("load", () => typeset(view));

  return { typeset };
})();
