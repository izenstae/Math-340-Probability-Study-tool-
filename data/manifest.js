/* ============================================================
 * MATH 340 Probability Studio — course manifest
 * ------------------------------------------------------------
 * Central registry for course content. Each chapter/unit lives
 * in its own file under data/ and registers itself by calling
 * MATH340.registerUnit(...). To add a new week of material:
 *   1. create data/chN.js following the pattern of ch1.js
 *   2. add a <script src="data/chN.js"></script> tag to index.html
 * Nothing else needs to change — the app picks it up everywhere.
 * ============================================================ */

window.MATH340 = {
  course: {
    code: "MATH 340",
    name: "Probability",
    term: "Fall 2026",
    instructor: "Suxian Zhou",
    textbook: "Blitzstein & Hwang, Introduction to Probability (2nd ed.)",
    // Monday of Week 1 (term start). Used to compute the current week.
    termStart: "2026-09-14",
  },

  // Tentative course schedule (from the syllabus).
  schedule: [
    { week: 1,  topic: "Chap 1: Definition of Probability and Counting Techniques", quiz: false },
    { week: 2,  topic: "Chap 2: Conditional Probability and Bayes' Rule",           quiz: true  },
    { week: 3,  topic: "Chap 3 & 4: Discrete Distributions",                        quiz: true  },
    { week: 4,  topic: "Chap 4 & 5: Expectation and Variance",                      quiz: true  },
    { week: 5,  topic: "Chap 5 & 8: Continuous Distributions",                      quiz: true  },
    { week: 6,  topic: "Review and Midterm Exam",                                   quiz: false },
    { week: 7,  topic: "Chap 6: Moments and Moment Generating Functions",           quiz: true  },
    { week: 8,  topic: "Chap 7: Multivariate Distributions",                        quiz: true  },
    { week: 9,  topic: "Chap 8: Limit Laws and Central Limit Theorem",              quiz: true  },
    { week: 10, topic: "Final Exam Review",                                         quiz: false },
  ],

  keyDates: [
    { date: "2026-09-25", label: "Homework 1 & 2 due (5:00 pm)",            kind: "hw"   },
    { date: "2026-10-21", label: "Midterm Exam · 1:50–3:00 pm",             kind: "exam" },
    { date: "2026-11-13", label: "Last day to request final-exam change",   kind: "info" },
    { date: "2026-11-23", label: "Final Exam · 11:30 am–2:00 pm (cumulative)", kind: "exam" },
  ],

  gradeWeights: [
    { name: "Participation", pct: 5 },
    { name: "Homework",      pct: 15 },
    { name: "Quizzes",       pct: 25 },
    { name: "Midterm",       pct: 20 },
    { name: "Final Exam",    pct: 25 },
    { name: "Final Project", pct: 10 },
  ],

  // Registered content units (chapters / reference decks).
  units: [],

  registerUnit(unit) {
    // unit: { id, title, short, week, order, flashcards:[], generators:[], reference?:fn }
    this.units.push(unit);
    this.units.sort((a, b) => (a.order ?? a.week ?? 99) - (b.order ?? b.week ?? 99));
  },

  getUnit(id) { return this.units.find(u => u.id === id); },

  currentWeek(now) {
    const start = new Date(this.course.termStart + "T00:00:00");
    const d = now || new Date();
    const wk = Math.floor((d - start) / (7 * 24 * 3600 * 1000)) + 1;
    return Math.min(Math.max(wk, 0), 11); // 0 = before term, 11 = after
  },

  // ---- small math/random utilities shared by problem generators ----
  util: {
    randInt(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); },
    pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; },
    shuffle(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    },
    factorial(n) { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; },
    perm(n, k) { let r = 1; for (let i = 0; i < k; i++) r *= (n - i); return r; },
    choose(n, k) {
      if (k < 0 || k > n) return 0;
      k = Math.min(k, n - k);
      let r = 1;
      for (let i = 0; i < k; i++) r = r * (n - i) / (i + 1);
      return Math.round(r);
    },
    round(x, d) { const p = Math.pow(10, d); return Math.round(x * p) / p; },
    fmt(x, d = 4) {
      if (Number.isInteger(x)) return String(x);
      return String(Math.round(x * Math.pow(10, d)) / Math.pow(10, d));
    },
  },
};
