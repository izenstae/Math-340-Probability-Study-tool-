/* ============================================================
 * Practice view — randomly generated problems with worked
 * solutions. Answers may be typed as decimals or fractions.
 * ============================================================ */
const Practice = (() => {
  let current = null; // { gen, problem, answered }
  let filterUnit = "all";

  function parseAnswer(text) {
    text = (text || "").trim().replace(/\s+/g, "");
    if (!text) return NaN;
    // percentage, e.g. "25%"
    if (/^-?\d*\.?\d+%$/.test(text)) return parseFloat(text) / 100;
    // fraction, e.g. "5/36" or "0.5/2"
    const frac = text.match(/^(-?\d*\.?\d+)\/(-?\d*\.?\d+)$/);
    if (frac) {
      const den = parseFloat(frac[2]);
      return den === 0 ? NaN : parseFloat(frac[1]) / den;
    }
    // scientific or plain number
    const v = Number(text);
    return Number.isFinite(v) ? v : NaN;
  }

  function checkAnswer(problem, userValue) {
    if (!Number.isFinite(userValue)) return false;
    const ans = problem.answer;
    if (problem.kind === "count") return Math.abs(userValue - ans) < 0.5; // exact integers
    const tol = problem.tol != null ? problem.tol : Math.max(0.0006, Math.abs(ans) * 0.004);
    return Math.abs(userValue - ans) <= tol;
  }

  function home(el) {
    current = null;
    const units = MATH340.units.filter(u => u.generators && u.generators.length);
    const opts = [`<option value="all">All chapters</option>`]
      .concat(units.map(u => `<option value="${u.id}" ${filterUnit === u.id ? "selected" : ""}>${u.title}</option>`)).join("");

    let rows = "";
    for (const u of units) {
      if (filterUnit !== "all" && filterUnit !== u.id) continue;
      for (const g of u.generators) {
        const p = Store.getPractice(g.id);
        const acc = p.attempts ? Math.round(100 * p.correct / p.attempts) : null;
        const recent = p.recent.slice(-5).map(r => r
          ? `<span style="color:var(--green)">●</span>`
          : `<span style="color:var(--red)">●</span>`).join(" ");
        rows += `
          <div class="topic-row">
            <div style="flex:1; min-width:0;">
              <div class="deck-name">${g.name}</div>
              <div class="deck-meta">${g.blurb || ""} · <span class="pill">${u.short || u.title}</span></div>
            </div>
            <div class="muted" style="min-width:110px; text-align:right;">
              ${p.attempts ? `${p.correct}/${p.attempts} (${acc}%)<br><span style="font-size:11px">${recent}</span>` : "not started"}
            </div>
            <button class="btn btn-sm" data-gen="${g.id}">Practice</button>
          </div>`;
      }
    }

    el.innerHTML = `
      <div class="card">
        <h2>Practice Problems</h2>
        <p class="muted">Every problem is freshly generated with new numbers, so you can practice a topic until the <em>method</em> sticks. Answers accept decimals (<code>0.1389</code>), fractions (<code>5/36</code>), or percents (<code>13.9%</code>).</p>
        <div class="toolbar">
          <select class="select" id="pFilter">${opts}</select>
          <button class="btn" id="pMix">▶ Mixed session (random topics)</button>
        </div>
        <div>${rows || `<div class="empty-state">No practice topics in this chapter yet.</div>`}</div>
      </div>`;

    el.querySelector("#pFilter").addEventListener("change", e => { filterUnit = e.target.value; home(el); });
    el.querySelector("#pMix").addEventListener("click", () => {
      const pool = [];
      for (const u of units) {
        if (filterUnit !== "all" && filterUnit !== u.id) continue;
        pool.push(...u.generators);
      }
      if (pool.length) start(el, MATH340.util.pick(pool).id, true);
    });
    el.querySelectorAll("[data-gen]").forEach(b =>
      b.addEventListener("click", () => start(el, b.dataset.gen, false)));
    App.typeset(el);
  }

  function findGen(id) {
    for (const u of MATH340.units) {
      for (const g of (u.generators || [])) if (g.id === id) return { gen: g, unit: u };
    }
    return null;
  }

  function start(el, genId, mixed) {
    const found = findGen(genId);
    if (!found) return home(el);
    current = { ...found, problem: found.gen.make(), answered: false, mixed: !!mixed };
    render(el);
  }

  function render(el) {
    const c = current;
    if (!c) return home(el);
    const p = c.problem;
    const stats = Store.getPractice(c.gen.id);
    el.innerHTML = `
      <div class="card" style="max-width: 820px; margin: 0 auto;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
          <span class="pill pill-accent">${c.unit.short || c.unit.title}</span>
          <span class="muted">${c.gen.name} · ${stats.attempts ? `${stats.correct}/${stats.attempts} correct so far` : "first attempt"}</span>
        </div>
        <div class="q-text" id="qText">${p.q}</div>
        <div class="answer-row">
          <input type="text" id="ansInput" placeholder="${p.kind === "count" ? "Enter a whole number…" : "Enter a probability, e.g. 0.25 or 1/4…"}" autocomplete="off" ${c.answered ? "disabled" : ""}>
          ${c.answered ? "" : `<button class="btn" id="ansCheck">Check</button>
          <button class="btn btn-ghost" id="ansGiveUp">Show solution</button>`}
        </div>
        <div id="resultZone"></div>
        <div style="display:flex; gap:10px; margin-top:20px; flex-wrap:wrap;">
          <button class="btn btn-ghost btn-sm" id="pBack">← All topics</button>
          <span style="flex:1"></span>
          ${c.answered ? `<button class="btn" id="pNext">Next problem →</button>` : ""}
        </div>
      </div>`;

    const input = el.querySelector("#ansInput");
    const resultZone = el.querySelector("#resultZone");

    const finish = (correct, gaveUp) => {
      if (c.answered) return;
      c.answered = true;
      Store.recordPractice(c.gen.id, correct);
      resultZone.innerHTML = `
        <div class="verdict ${correct ? "ok" : "bad"}">
          ${correct ? "✓ Correct!" : gaveUp ? "Solution revealed — counted as a miss." : "✗ Not quite."}
          ${!correct ? ` The answer is <b>${MATH340.util.fmt(p.answer, 5)}</b>.` : ""}
        </div>
        <div class="solution"><b>Worked solution</b>${p.sol}</div>`;
      render2(); // re-render buttons (next problem)
    };

    const render2 = () => {
      // lightweight: just swap the action buttons without redrawing the solution
      const row = el.querySelector(".answer-row");
      row.querySelectorAll("button").forEach(b => b.remove());
      input.disabled = true;
      const footer = el.querySelector("#pBack").parentElement;
      if (!el.querySelector("#pNext")) {
        const next = document.createElement("button");
        next.className = "btn"; next.id = "pNext"; next.textContent = "Next problem →";
        footer.appendChild(next);
        next.addEventListener("click", () => start(el, nextGenId(), c.mixed));
        next.focus();
      }
      App.typeset(resultZone);
    };

    const nextGenId = () => {
      if (!c.mixed) return c.gen.id;
      const pool = [];
      for (const u of MATH340.units) pool.push(...(u.generators || []));
      return MATH340.util.pick(pool).id;
    };

    if (!c.answered) {
      el.querySelector("#ansCheck").addEventListener("click", () => {
        const v = parseAnswer(input.value);
        if (!Number.isFinite(v)) {
          resultZone.innerHTML = `<div class="verdict bad">Please enter a number, fraction, or percent.</div>`;
          return;
        }
        finish(checkAnswer(p, v), false);
      });
      el.querySelector("#ansGiveUp").addEventListener("click", () => finish(false, true));
      input.addEventListener("keydown", e => {
        if (e.key === "Enter") el.querySelector("#ansCheck")?.click();
      });
      input.focus();
    } else {
      el.querySelector("#pNext")?.addEventListener("click", () => start(el, nextGenId(), c.mixed));
    }
    el.querySelector("#pBack").addEventListener("click", () => home(el));
    App.typeset(el);
  }

  return { mount: home };
})();
