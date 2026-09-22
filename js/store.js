/* ============================================================
 * Progress store — persists to localStorage.
 * Shape:
 * {
 *   cards:    { [cardId]: { box, due, seen, lapses } },
 *   practice: { [genId]: { attempts, correct, recent: [0|1,...] } },
 *   activity: { [YYYY-MM-DD]: count },   // reviews + problems per day
 * }
 * ============================================================ */
const Store = (() => {
  const KEY = "math340-progress-v1";
  const THEME_KEY = "math340-theme";

  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* storage unavailable or corrupted — start fresh */ }
    return { cards: {}, practice: {}, activity: {} };
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }

  function todayKey() {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  function bumpActivity() {
    const k = todayKey();
    state.activity[k] = (state.activity[k] || 0) + 1;
    save();
  }

  return {
    // ---- flashcards (Leitner boxes 1..5) ----
    getCard(id) {
      return state.cards[id] || { box: 0, due: 0, seen: 0, lapses: 0 };
    },
    gradeCard(id, correct) {
      const c = this.getCard(id);
      const intervals = [0, 0, 1, 2, 4, 7]; // days until due, by box
      if (correct) c.box = Math.min((c.box || 0) + 1, 5);
      else { c.box = 1; c.lapses = (c.lapses || 0) + 1; }
      c.seen = (c.seen || 0) + 1;
      c.due = Date.now() + intervals[c.box] * 24 * 3600 * 1000;
      state.cards[id] = c;
      bumpActivity();
      save();
      return c;
    },
    deckStats(cards) {
      let started = 0, mastered = 0, due = 0, boxSum = 0;
      const now = Date.now();
      for (const card of cards) {
        const c = state.cards[card.id];
        if (c && c.seen > 0) {
          started++;
          boxSum += c.box;
          if (c.box >= 4) mastered++;
          if (c.due <= now) due++;
        } else {
          due++; // new cards count as available to study
        }
      }
      const mastery = cards.length ? boxSum / (cards.length * 5) : 0;
      return { total: cards.length, started, mastered, due, mastery };
    },

    // ---- practice ----
    getPractice(genId) {
      return state.practice[genId] || { attempts: 0, correct: 0, recent: [] };
    },
    recordPractice(genId, correct) {
      const p = this.getPractice(genId);
      p.attempts++;
      if (correct) p.correct++;
      p.recent.push(correct ? 1 : 0);
      if (p.recent.length > 10) p.recent.shift();
      state.practice[genId] = p;
      bumpActivity();
      save();
      return p;
    },
    practiceStats(generators) {
      let attempts = 0, correct = 0, recentAcc = null, recentN = 0, recentHits = 0;
      for (const g of generators) {
        const p = state.practice[g.id];
        if (!p) continue;
        attempts += p.attempts;
        correct += p.correct;
        recentN += p.recent.length;
        recentHits += p.recent.reduce((a, b) => a + b, 0);
      }
      if (recentN > 0) recentAcc = recentHits / recentN;
      return { attempts, correct, accuracy: attempts ? correct / attempts : null, recentAcc };
    },

    // ---- activity / streak ----
    activity() { return state.activity; },
    streak() {
      let s = 0;
      const d = new Date();
      // today counts if there is activity; otherwise start from yesterday
      const key = dt => dt.getFullYear() + "-" + String(dt.getMonth() + 1).padStart(2, "0") + "-" + String(dt.getDate()).padStart(2, "0");
      if (!state.activity[key(d)]) d.setDate(d.getDate() - 1);
      while (state.activity[key(d)]) { s++; d.setDate(d.getDate() - 1); }
      return s;
    },
    totalReviews() {
      return Object.values(state.activity).reduce((a, b) => a + b, 0);
    },

    // ---- export / import / reset ----
    exportJSON() { return JSON.stringify(state, null, 2); },
    importJSON(text) {
      const parsed = JSON.parse(text);
      if (!parsed || typeof parsed !== "object" || !parsed.cards) throw new Error("Not a valid progress file.");
      state = { cards: parsed.cards || {}, practice: parsed.practice || {}, activity: parsed.activity || {} };
      save();
    },
    reset() {
      state = { cards: {}, practice: {}, activity: {} };
      save();
    },

    // ---- theme ----
    getTheme() { try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; } },
    setTheme(t) { try { localStorage.setItem(THEME_KEY, t); } catch (e) { /* ignore */ } },
  };
})();
