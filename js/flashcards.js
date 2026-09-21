/* ============================================================
 * Flashcards view — Leitner spaced repetition over the decks
 * registered in MATH340.units.
 * ============================================================ */
const Flashcards = (() => {
  let session = null; // { unit, queue, idx, revealed, done, right, wrong }

  function decksHome(el) {
    session = null;
    const decks = MATH340.units.filter(u => u.flashcards && u.flashcards.length);
    let html = `
      <div class="card">
        <h2>Flashcard Decks</h2>
        <p class="muted">Spaced repetition with Leitner boxes: answer a card correctly and it moves up a box (reviewed less often); miss it and it returns to box 1. A card in box 4+ counts as mastered.</p>
        <div>`;
    for (const u of decks) {
      const s = Store.deckStats(u.flashcards);
      html += `
        <div class="deck-row">
          <div class="deck-info">
            <div class="deck-name">${u.title}</div>
            <div class="deck-meta">${s.total} cards · ${s.mastered} mastered · ${s.due} ready to review</div>
          </div>
          <div class="deck-bar">
            <div class="progress-bar"><div style="width:${Math.round(s.mastery * 100)}%"></div></div>
            <div class="muted" style="text-align:right; margin-top:3px">${Math.round(s.mastery * 100)}%</div>
          </div>
          <button class="btn btn-sm" data-deck="${u.id}">Study</button>
        </div>`;
    }
    html += `</div></div>
      <div class="card">
        <h3 style="margin-top:0">How to use this well</h3>
        <ul class="muted" style="margin:6px 0 0; padding-left: 20px;">
          <li>Say the answer <em>out loud or on paper</em> before flipping — recognition is not recall.</li>
          <li>Review a little every day; the schedule spaces cards for you.</li>
          <li>Before a quiz (Wednesdays), run the deck for last week's chapter.</li>
        </ul>
      </div>`;
    el.innerHTML = html;
    el.querySelectorAll("[data-deck]").forEach(b =>
      b.addEventListener("click", () => startSession(el, b.dataset.deck)));
    App.typeset(el);
  }

  function startSession(el, unitId) {
    const unit = MATH340.getUnit(unitId);
    const now = Date.now();
    // due cards first (oldest due first), then unseen, then the rest
    const cards = unit.flashcards.slice();
    const due = [], fresh = [], later = [];
    for (const c of cards) {
      const st = Store.getCard(c.id);
      if (!st.seen) fresh.push(c);
      else if (st.due <= now) due.push(c);
      else later.push(c);
    }
    const queue = MATH340.util.shuffle(due).concat(MATH340.util.shuffle(fresh), MATH340.util.shuffle(later));
    session = { unit, queue, idx: 0, revealed: false, right: 0, wrong: 0 };
    render(el);
  }

  function render(el) {
    const s = session;
    if (!s) return decksHome(el);
    if (s.idx >= s.queue.length) {
      const total = s.right + s.wrong;
      el.innerHTML = `
        <div class="fc-stage">
          <div class="card" style="text-align:center; padding: 40px 24px;">
            <div style="font-size: 40px;">✓</div>
            <h2>Deck complete</h2>
            <p class="muted">${s.unit.title}</p>
            <div class="grid-3" style="max-width: 420px; margin: 18px auto;">
              <div class="stat"><div class="num">${total}</div><div class="lbl">Reviewed</div></div>
              <div class="stat"><div class="num" style="color:var(--green)">${s.right}</div><div class="lbl">Correct</div></div>
              <div class="stat"><div class="num" style="color:var(--red)">${s.wrong}</div><div class="lbl">Missed</div></div>
            </div>
            <div style="display:flex; gap:10px; justify-content:center;">
              <button class="btn" id="fcAgain">Study again</button>
              <button class="btn btn-ghost" id="fcBack">All decks</button>
            </div>
          </div>
        </div>`;
      el.querySelector("#fcAgain").addEventListener("click", () => startSession(el, s.unit.id));
      el.querySelector("#fcBack").addEventListener("click", () => decksHome(el));
      return;
    }

    const card = s.queue[s.idx];
    const st = Store.getCard(card.id);
    const dots = Array.from({ length: 5 }, (_, i) => `<span class="${i < st.box ? "on" : ""}"></span>`).join("");
    el.innerHTML = `
      <div class="fc-stage">
        <div class="fc-progress">
          ${s.unit.short || s.unit.title} · card ${s.idx + 1} of ${s.queue.length}
          <span style="margin-left:12px" class="pill pill-green">${s.right} ✓</span>
          <span class="pill pill-red">${s.wrong} ✗</span>
        </div>
        <div class="fc-card" id="fcCard" tabindex="0" role="button" aria-label="Flashcard — click to flip">
          <div class="fc-tag" style="display:flex; justify-content:space-between; align-items:center;">
            <span>${card.tag || ""}</span>
            <span class="box-dots" title="Leitner box ${st.box} of 5">${dots}</span>
          </div>
          <div class="fc-front">${card.front}</div>
          ${s.revealed ? `<div class="fc-back">${card.back}</div>` : ""}
          ${s.revealed ? "" : `<div class="fc-hint">Click or press Space to reveal the answer</div>`}
        </div>
        <div class="fc-actions">
          ${s.revealed
            ? `<button class="btn btn-red" id="fcMiss">✗ Missed it</button>
               <button class="btn btn-green" id="fcGot">✓ Got it</button>`
            : `<button class="btn btn-ghost" id="fcSkipDeck">Back to decks</button>
               <button class="btn" id="fcReveal">Reveal</button>`}
        </div>
      </div>`;

    const flip = () => { if (!s.revealed) { s.revealed = true; render(el); } };
    el.querySelector("#fcCard").addEventListener("click", flip);
    if (s.revealed) {
      el.querySelector("#fcGot").addEventListener("click", () => grade(el, true));
      el.querySelector("#fcMiss").addEventListener("click", () => grade(el, false));
    } else {
      el.querySelector("#fcReveal").addEventListener("click", flip);
      el.querySelector("#fcSkipDeck").addEventListener("click", () => decksHome(el));
    }
    App.typeset(el);
  }

  function grade(el, correct) {
    const s = session;
    const card = s.queue[s.idx];
    Store.gradeCard(card.id, correct);
    if (correct) s.right++; else s.wrong++;
    s.idx++;
    s.revealed = false;
    render(el);
  }

  function onKey(e, el) {
    if (!session) return;
    if (e.code === "Space" || e.key === " ") {
      if (!session.revealed && session.idx < session.queue.length) { e.preventDefault(); session.revealed = true; render(el); }
    } else if (session.revealed) {
      if (e.key === "1" || e.key.toLowerCase() === "j") grade(el, false);
      if (e.key === "2" || e.key.toLowerCase() === "k") grade(el, true);
    }
  }

  return { mount: decksHome, onKey };
})();
