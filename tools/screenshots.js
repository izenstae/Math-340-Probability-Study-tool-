#!/usr/bin/env node
/* ============================================================
 * Regenerate the README screenshots in docs/assets/.
 *
 *   node tools/screenshots.js [output-dir]
 *
 * Needs Playwright with Chromium (npm i -g playwright, or any global
 * install). Not part of CI. It seeds a plausible mid-term study history
 * into localStorage (real card and topic ids, a few real misses, two
 * quiz sittings, a 14-day activity strip), then captures each view.
 * Randomness is seeded, so re-running gives the same problems; the
 * dates and "week N" banner follow the machine's clock.
 * ============================================================ */
let chromium;
try { ({ chromium } = require('playwright')); }
catch (e) { ({ chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright')); }
const path = require('path');
const ROOT = path.join(__dirname, '..');
const OUT = process.argv[2] || path.join(ROOT, 'docs', 'assets');
const URL = 'file://' + path.join(ROOT, 'index.html');

// Seeded PRNG so the screenshots are reproducible.
const initRandom = `(() => { let s = 20260929; Math.random = () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; }; })();`;

function seedScript() {
  // Runs in the page after the data files load: builds a plausible Week-3 study history.
  const DAY = 864e5, now = Date.now();
  const st = { v: 2, cards: {}, practice: {}, misses: [], exams: [], sheet: [], activity: {} };
  let r = 7; const rnd = () => (r = (r * 16807) % 2147483647) / 2147483647;
  for (const u of MATH340.units) {
    u.flashcards.forEach((c, i) => {
      const lvl = u.id === 'ch1' ? 0.85 : u.id === 'ch2' ? 0.7 : u.id === 'ch3' ? 0.45 : 0.3;
      if (rnd() > lvl + 0.1) return;                    // never seen
      const box = Math.max(1, Math.min(6, Math.round(lvl * 6 * (0.6 + rnd() * 0.7))));
      st.cards[c.id] = { box, due: now + (rnd() < 0.35 ? -DAY : DAY * box), seen: box + 1, lapses: rnd() < 0.3 ? 1 : 0 };
    });
    for (const g of u.generators || []) {
      const acc = u.id === 'ch1' ? 0.78 : u.id === 'ch2' ? 0.66 : 0.55;
      const late = ['c3-gen-geom', 'c3-gen-pois', 'c3-gen-indep-rv'].includes(g.id);
      if (late && rnd() < 0.5) continue;
      const attempts = late ? 3 + Math.floor(rnd() * 4) : 6 + Math.floor(rnd() * 12);
      const p = { attempts, correct: 0, recent: [], variants: {} };
      for (let i = 0; i < attempts; i++) {
        const v = g.variantNames[i % g.variantNames.length];
        const hit = rnd() < acc + (rnd() - 0.5) * 0.3 ? 1 : 0;
        p.correct += hit; p.recent.push(hit); if (p.recent.length > 10) p.recent.shift();
        p.variants[v] = p.variants[v] || { a: 0, c: 0 }; p.variants[v].a++; p.variants[v].c += hit;
      }
      st.practice[g.id] = p;
    }
  }
  // a few real misses, generated from real generators
  for (const id of ['c2-gen-bayes', 'c2-gen-info', 'c3-gen-hgeom', 'c3-gen-geom']) {
    for (const u of MATH340.units) for (const g of u.generators || []) if (g.id === id) {
      const pr = g.make();
      st.misses.push({ key: id + ':' + pr.variant + ':' + st.misses.length, genId: id, unitId: u.id, variant: pr.variant, q: pr.q, sol: pr.sol, answer: pr.answer, kind: pr.kind, tol: pr.tol, at: now - DAY });
    }
  }
  st.exams = [
    { at: now - 9 * DAY, label: 'Wednesday quiz', scope: 'ch1', scopeLabel: 'Chapter 1 · Probability and Counting', n: 5, correct: 3, seconds: 870, limit: 900, items: [] },
    { at: now - 2 * DAY, label: 'Wednesday quiz', scope: 'ch2', scopeLabel: 'Chapter 2 · Conditional Probability', n: 5, correct: 4, seconds: 780, limit: 900, items: [] },
  ];
  const ch3 = MATH340.units.find(u => u.id === 'ch3');
  st.sheet = MATH340.units.find(u => u.id === 'ch2').flashcards.slice(0, 6).map(c => c.id)
    .concat(ch3.flashcards.filter(c => /geom|nbin|pois|binom-pmf|hgeom-pmf/.test(c.id)).map(c => c.id));
  for (let d = 0; d < 14; d++) {
    if (d === 4 || d === 9) continue;
    const dt = new Date(now - d * DAY);
    const k = dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0');
    st.activity[k] = 8 + Math.floor(rnd() * 40);
  }
  localStorage.setItem('math340-progress-v1', JSON.stringify(st));
  localStorage.setItem('math340-theme', 'light');
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 878 }, deviceScaleFactor: 1.954 });
  await ctx.addInitScript(initRandom);
  const page = await ctx.newPage();
  page.on('pageerror', e => console.error('PAGE ERROR', e.message));
  await page.goto(URL);
  await page.evaluate(`(${seedScript})()`);
  await page.reload(); await page.waitForTimeout(300);
  const shot = async (route, name, prep) => {
    await page.goto(URL + '#/' + route); await page.waitForTimeout(400);
    if (prep) await prep();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(OUT, name + '.png') });
    console.log('saved', name);
  };
  await shot('dashboard', 'dashboard');
  await shot('practice', 'practice', async () => {
    await page.click('[data-gen="c3-gen-geom"]'); await page.waitForTimeout(300);
    await page.fill('#ansInput', '0.05'); await page.click('#ansCheck');
  });
  await shot('exam', 'exam', async () => {
    await page.click('[data-preset="quiz"]'); await page.waitForTimeout(300);
    await page.fill('#exAns', '0.2'); await page.click('#exNext'); await page.waitForTimeout(200);
    await page.click('#exFlag');
  });
  await shot('flashcards', 'flashcards', async () => {
    await page.click('[data-cram="ch3"]'); await page.waitForTimeout(300);
    await page.click('#fcReveal');
  });
  await shot('reference', 'reference', async () => {
    await page.evaluate(() => { const b = document.querySelector('[data-pick="c3-geom-story"]'); const row = b && b.closest('div'); (row || b).scrollIntoView({ block: 'start' }); window.scrollBy(0, -140); document.querySelector('.content') && document.querySelector('.content').scrollBy(0, -140); });
  });
  await shot('progress', 'progress');
  await browser.close();
})();
