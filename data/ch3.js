/* ============================================================
 * Chapter 3 — Random Variables and Their Distributions  (Week 3)
 * Source: class lecture notes (C3, part 1) + Blitzstein & Hwang ch. 3
 * Covers: random variables, PMFs, CDFs, Bernoulli & Binomial,
 *         Hypergeometric, Binomial vs Hypergeometric.
 * ============================================================ */
(function () {
  const U = MATH340.util;
  const R = String.raw;

  const flashcards = [
    {
      id: "c3-rv-def", tag: "Definition 3.1.1",
      front: R`Define a <em>random variable</em>.`,
      back: R`Given an experiment with sample space \(S\), a random variable (r.v.) is a <b>function</b> from the sample space to the real numbers: $$X : S \to \mathbb{R}.$$ It assigns a number \(X(s)\) to each outcome \(s\). The randomness comes from which outcome occurs, not from the function.`,
    },
    {
      id: "c3-rv-event", tag: "Common pitfall",
      front: R`What kind of object is \(X\)? What kind of object is \(\{X = 3\}\)? What kind is \(P(X = 3)\)?`,
      back: R`\(X\) is a <b>function</b> (a random number). \(\{X = 3\} = \{s \in S : X(s) = 3\}\) is an <b>event</b> (a subset of \(S\)). \(P(X = 3)\) is a <b>number</b> in \([0, 1]\). Writing \(P(X)\) is meaningless: you can only take \(P\) of an event.`,
    },
    {
      id: "c3-discrete-def", tag: "Definition",
      front: R`When is a random variable <em>discrete</em>?`,
      back: R`When its possible values form a <b>finite set</b> or can be <b>listed in an infinite sequence</b> (countably infinite), e.g. \(\{0, 1, 2, \dots\}\). Counts are the typical example: number of defectives, number of tosses until the first tail.`,
    },
    {
      id: "c3-continuous-def", tag: "Definition",
      front: R`When is a random variable <em>continuous</em>? (Two conditions.)`,
      back: R`1. Its possible values are <b>all numbers in an interval</b> (or a union of intervals).<br>2. <b>No single value has positive probability</b>: \(P(X = c) = 0\) for every \(c\).<br>Measurements (length, height, pH, tension) are the typical example.`,
    },
    {
      id: "c3-support", tag: "Definition 3.2.2",
      front: R`What is the <em>support</em> of a discrete r.v. \(X\)?`,
      back: R`The set of values \(x\) with \(P(X = x) > 0\). Always write it down first: it tells you which terms appear in a sum, and a probability for a value outside the support is simply \(0\).`,
    },
    {
      id: "c3-pmf-def", tag: "Definition 3.2.3",
      front: R`Define the <em>probability mass function</em> (PMF) of a discrete r.v. \(X\).`,
      back: R`$$p_X(x) = P(X = x).$$ It is positive on the support of \(X\) and \(0\) everywhere else.`,
    },
    {
      id: "c3-pmf-valid", tag: "Theorem 3.2.7",
      front: R`What two conditions make a function \(p_X\) a <em>valid PMF</em>?`,
      back: R`1. <b>Nonnegative:</b> \(p_X(x) \ge 0\) for all \(x\) (and \(> 0\) on the support).<br>2. <b>Sums to 1:</b> $$\sum_{x} p_X(x) = 1.$$ Condition 2 is how you find an unknown constant \(c\) in a PMF.`,
    },
    {
      id: "c3-pmf-events", tag: "Using a PMF",
      front: R`How do you get \(P(X \in A)\) from the PMF — e.g. \(P(1 \le X \le 3)\)?`,
      back: R`Add the PMF over the values in \(A\): $$P(X \in A) = \sum_{x \in A} p_X(x).$$ For a count-valued \(X\): "at least 2" is \(X \ge 2\); "more than 2" is \(X \ge 3\); "at most 2" is \(X \le 2\); "fewer than 2" is \(X \le 1\). Use the complement when it has fewer terms.`,
    },
    {
      id: "c3-cdf-def", tag: "Definition 3.6.1",
      front: R`Define the <em>cumulative distribution function</em> (CDF) of a random variable \(X\).`,
      back: R`$$F_X(x) = P(X \le x) \quad\text{for every real } x.$$ For a discrete \(X\), \(F_X(x) = \sum_{y \le x} p_X(y)\): a <b>step function</b> that jumps at each value in the support.`,
    },
    {
      id: "c3-cdf-props", tag: "Theorem 3.6.3",
      front: R`What three properties does every CDF \(F\) have?`,
      back: R`1. <b>Increasing:</b> \(x_1 \le x_2 \Rightarrow F(x_1) \le F(x_2)\).<br>2. <b>Right-continuous:</b> at each jump, \(F\) takes the <em>upper</em> value (the dot is filled on the right piece).<br>3. <b>Limits:</b> \(F(x) \to 0\) as \(x \to -\infty\) and \(F(x) \to 1\) as \(x \to \infty\).`,
    },
    {
      id: "c3-cdf-interval", tag: "Proposition",
      front: R`Express \(P(a < X \le b)\) and \(P(X > a)\) in terms of the CDF \(F\).`,
      back: R`$$P(a < X \le b) = F(b) - F(a), \qquad P(X > a) = 1 - F(a).$$ The endpoints matter: \(\le\) on the right and \(<\) on the left is exactly what \(F(b) - F(a)\) counts. For an integer-valued \(X\), \(P(a \le X \le b) = F(b) - F(a - 1)\).`,
    },
    {
      id: "c3-cdf-jump", tag: "CDF ↔ PMF",
      front: R`Given the CDF of a discrete r.v., how do you recover \(P(X = x)\)?`,
      back: R`\(P(X = x)\) is the <b>size of the jump</b> of \(F\) at \(x\): $$P(X = x) = F(x) - F(x^-),$$ where \(F(x^-)\) is the value just to the left of \(x\). Where \(F\) is flat there is no jump, so \(P(X = x) = 0\).`,
    },
    {
      id: "c3-bern", tag: "Definition 3.3.1",
      front: R`Define the <em>Bernoulli distribution</em> \(\text{Bern}(p)\).`,
      back: R`\(X \sim \text{Bern}(p)\) if $$P(X = 1) = p, \qquad P(X = 0) = 1 - p, \qquad 0 &lt; p &lt; 1.$$ A single trial that succeeds (1) or fails (0).`,
    },
    {
      id: "c3-indicator", tag: "Definition 3.3.2",
      front: R`Define the <em>indicator random variable</em> \(I_A\) of an event \(A\). What is its distribution?`,
      back: R`$$I_A = \begin{cases} 1, & \text{if } A \text{ occurs}, \\ 0, & \text{if } A \text{ does not occur.} \end{cases}$$ \(I_A \sim \text{Bern}(p)\) with \(p = P(A)\). Every Bernoulli r.v. is the indicator of its "success" event.`,
    },
    {
      id: "c3-bern-trial", tag: "Definition",
      front: R`What is a <em>Bernoulli trial</em>?`,
      back: R`An experiment that results in either a <b>success</b> or a <b>failure</b> (but not both). The indicator of success is \(\text{Bern}(p)\), where \(p = P(\text{success})\).`,
    },
    {
      id: "c3-binom-exp", tag: "Binomial experiment",
      front: R`List the four conditions for a <em>binomial experiment</em>.`,
      back: R`1. A <b>fixed number</b> of trials, \(n\).<br>2. Each trial has exactly <b>two outcomes</b>, success or failure.<br>3. The trials are <b>independent</b>.<br>4. The success probability \(p\) is the <b>same</b> on every trial.<br>If any fails (e.g. drawing without replacement breaks 3 and 4), \(X\) is not Binomial.`,
    },
    {
      id: "c3-binom-def", tag: "Definition 3.3.3",
      front: R`State the story of the <em>Binomial distribution</em> \(\text{Bin}(n, p)\).`,
      back: R`\(n\) independent Bernoulli trials, each with success probability \(p\). Then $$X = \text{number of successes} \sim \text{Bin}(n, p),$$ with \(n \in \{1, 2, \dots\}\) and \(0 &lt; p &lt; 1\). \(\text{Bin}(1, p)\) is \(\text{Bern}(p)\).`,
    },
    {
      id: "c3-binom-pmf", tag: "Theorem 3.3.5",
      front: R`State the PMF of \(X \sim \text{Bin}(n, p)\) and explain each factor.`,
      back: R`$$P(X = k) = \binom{n}{k} p^k (1 - p)^{n - k}, \qquad k = 0, 1, \dots, n.$$ \(p^k(1-p)^{n-k}\) is the probability of <em>one particular</em> sequence with \(k\) successes (independence); \(\binom{n}{k}\) counts which \(k\) of the \(n\) positions are the successes.`,
    },
    {
      id: "c3-binom-sym", tag: "Theorem 3.3.7",
      front: R`If \(X \sim \text{Bin}(n, p)\), what is the distribution of the number of <em>failures</em>, \(n - X\)?`,
      back: R`$$n - X \sim \text{Bin}(n, 1 - p).$$ Swap the roles of success and failure. So "exactly \(j\) misses" is \(P(X = n - j)\).`,
    },
    {
      id: "c3-binom-atleast1", tag: "Binomial · complement",
      front: R`For \(X \sim \text{Bin}(n, p)\), what is the fastest way to get \(P(X \ge 1)\)?`,
      back: R`The complement: $$P(X \ge 1) = 1 - P(X = 0) = 1 - (1 - p)^n.$$ Summing \(P(X = 1) + \dots + P(X = n)\) gives the same answer with \(n\) terms instead of one.`,
    },
    {
      id: "c3-hgeom-def", tag: "Definition 3.4.1",
      front: R`State the story of the <em>Hypergeometric distribution</em> \(\text{HGeom}(w, b, n)\).`,
      back: R`An urn holds \(w\) white and \(b\) black balls. Draw \(n\) balls <b>without replacement</b>, all subsets of size \(n\) equally likely. Then $$X = \text{number of white balls drawn} \sim \text{HGeom}(w, b, n).$$`,
    },
    {
      id: "c3-hgeom-pmf", tag: "Theorem 3.4.2",
      front: R`State the PMF of \(X \sim \text{HGeom}(w, b, n)\) and explain each factor.`,
      back: R`$$P(X = k) = \frac{\binom{w}{k}\binom{b}{n - k}}{\binom{w + b}{n}}$$ for integers \(0 \le k \le w\) and \(0 \le n - k \le b\), and \(0\) otherwise. Numerator: choose \(k\) of the white balls <em>and</em> the other \(n - k\) from the black. Denominator: all ways to choose \(n\) of the \(w + b\) balls (naive definition).`,
    },
    {
      id: "c3-hgeom-support", tag: "HGeom · support",
      front: R`What values can \(X \sim \text{HGeom}(w, b, n)\) actually take?`,
      back: R`$$\max(0,\, n - b) \le k \le \min(n,\, w).$$ You cannot draw more white balls than there are (\(k \le w\)) or than you draw (\(k \le n\)), and if \(n > b\) at least \(n - b\) of the draws <em>must</em> be white. Outside this range \(P(X = k) = 0\).`,
    },
    {
      id: "c3-capture", tag: "Example · capture–recapture",
      front: R`A forest has \(N\) elk; \(m\) were tagged and released. Today \(n\) are captured at random. What is the distribution of the number of tagged elk in today's sample?`,
      back: R`$$X \sim \text{HGeom}(m,\ N - m,\ n), \qquad P(X = k) = \frac{\binom{m}{k}\binom{N - m}{n - k}}{\binom{N}{n}}.$$ Tagged elk are the "white balls" and untagged the "black balls". The same elk cannot be caught twice in one sample, so the draws are without replacement.`,
    },
    {
      id: "c3-bin-vs-hgeom", tag: "Binomial vs. Hypergeometric",
      front: R`An urn has \(w\) white and \(b\) black balls; draw \(n\). When is the number of white balls Binomial, and when is it Hypergeometric?`,
      back: R`<b>With replacement</b> ⇒ independent draws with constant \(p = \frac{w}{w + b}\) ⇒ \(\text{Bin}\left(n, \frac{w}{w+b}\right)\).<br><b>Without replacement</b> ⇒ dependent draws, and the success probability changes from draw to draw ⇒ \(\text{HGeom}(w, b, n)\).<br>Both count successes in \(n\) trials.`,
    },
    {
      id: "c3-waiting", tag: "Example · waiting time",
      front: R`Toss a coin whose tail probability is \(p\). Let \(X\) be the number of tosses until the first tail, <em>including</em> that toss. Find the PMF of \(X\) and \(P(X > k)\).`,
      back: R`\(X = k\) means \(k - 1\) heads, then a tail: $$P(X = k) = (1 - p)^{k - 1} p, \qquad k = 1, 2, 3, \dots$$ \(X > k\) means the first \(k\) tosses are all heads: \(P(X > k) = (1 - p)^k\). This is a valid PMF (geometric series sums to 1), and \(X\) is discrete but has infinitely many values.`,
    },
  ];

  /* ---------------- small helpers ---------------- */

  // k positive multiples of `step` (in hundredths) summing to 100.
  function pmfHundredths(k, step = 5) {
    const units = 100 / step;
    const parts = Array(k).fill(1);
    for (let i = 0; i < units - k; i++) parts[U.randInt(0, k - 1)]++;
    return parts.map(x => x * step);
  }
  const hund = h => U.fmt(h / 100, 2);                 // 35 -> "0.35"
  const sum = a => a.reduce((x, y) => x + y, 0);

  /* Redraw parameters until the answer is a probability worth computing:
   * "≈ 0.0000003" or "≈ 1" teaches nothing and reads like a bug. */
  function sane(make, lo = 0.01, hi = 0.99) {
    return function () {
      let p;
      for (let i = 0; i < 60; i++) { p = make(); if (p.answer >= lo && p.answer <= hi) return p; }
      return p;
    };
  }

  function binPmf(n, k, p) {
    if (k < 0 || k > n) return 0;
    return U.choose(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
  }
  function hgeomPmf(w, b, n, k) {
    if (k < 0 || k > w || n - k < 0 || n - k > b) return 0;
    return U.choose(w, k) * U.choose(b, n - k) / U.choose(w + b, n);
  }
  const binTex = (n, k, p) => R`\binom{${n}}{${k}}(${U.fmt(p, 2)})^{${k}}(${U.fmt(1 - p, 2)})^{${n - k}}`;
  const hgTex = (w, b, n, k) => R`\frac{\binom{${w}}{${k}}\binom{${b}}{${n - k}}}{\binom{${w + b}}{${n}}}`;

  function pmfTable(xs, ps, xLabel = "x", pLabel = R`p_X(x)`) {
    return R`<table class="tbl"><tr><th>\(${xLabel}\)</th>${xs.map(x => `<td>${x}</td>`).join("")}</tr>
      <tr><th>\(${pLabel}\)</th>${ps.map(p => `<td>${p}</td>`).join("")}</tr></table>`;
  }

  /* A random step CDF: sorted jump points with masses in hundredths. */
  function stepCdf() {
    const k = U.randInt(4, 5);
    const xs = U.sample([0, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 7, 8, 10], k).sort((a, b) => a - b);
    const ps = pmfHundredths(k);
    const F = [];
    ps.reduce((acc, p, i) => (F[i] = acc + p), 0);
    // F[i] = F at xs[i] (hundredths); F(-inf) = 0
    const cases = [R`0, & x < ${xs[0]}`];
    for (let i = 0; i < k - 1; i++) cases.push(R`${hund(F[i])}, & ${xs[i]} \le x < ${xs[i + 1]}`);
    cases.push(R`1, & x \ge ${xs[k - 1]}`);
    const tex = R`$$F(x) = \begin{cases} ${cases.join(R` \\ `)} \end{cases}$$`;
    const Fleft = i => (i === 0 ? 0 : F[i - 1]);        // F just left of xs[i]
    const Fat = x => { let v = 0; xs.forEach((xi, i) => { if (xi <= x) v = F[i]; }); return v; };
    return { k, xs, ps, F, tex, Fleft, Fat };
  }

  /* Binomial stories: p is stated as a rate so identifying it is part of the job. */
  const BIN_CTX = [
    () => {
      const [m, t] = U.pick([[3, 4], [2, 5], [7, 10], [3, 5], [4, 5], [1, 2], [13, 20]]);
      const n = U.randInt(6, 12);
      return { p: m / t, n, setup: R`On a basketball court you take ${n} free throws. Assume you make ${m} out of every ${t} free throws you attempt, independently from shot to shot.`,
        X: "the number of free throws you make", succ: "free throws you make", fail: "free throws you miss",
        pWhy: R`\(p = ${m}/${t} = ${U.fmt(m / t, 2)}\)` };
    },
    () => {
      const c = U.pick([4, 5]);
      const n = U.randInt(6, 12);
      return { p: 1 / c, n, setup: R`A student guesses blindly on all ${n} questions of a multiple-choice quiz. Each question has ${c} options, exactly one of them correct.`,
        X: "the number of questions answered correctly", succ: "correct answers", fail: "wrong answers",
        pWhy: R`\(p = 1/${c} = ${U.fmt(1 / c, 2)}\)` };
    },
    () => {
      const p = U.pick([0.6, 0.7, 0.75, 0.8, 0.85, 0.9]);
      const n = U.randInt(6, 12);
      return { p, n, setup: R`A packet contains ${n} seeds. Each seed germinates with probability ${p}, independently of the others.`,
        X: "the number of seeds that germinate", succ: "seeds that germinate", fail: "seeds that fail to germinate",
        pWhy: R`\(p = ${p}\)` };
    },
    () => {
      const p = U.pick([0.05, 0.1, 0.15, 0.2, 0.25]);
      const n = U.randInt(8, 15);
      return { p, n, setup: R`A machine produces items that are defective with probability ${p}, independently. A quality inspector examines the next ${n} items off the line.`,
        X: "the number of defective items", succ: "defective items", fail: "non-defective items",
        pWhy: R`\(p = ${p}\)` };
    },
    () => {
      const p = U.pick([0.3, 0.35, 0.4, 0.45, 0.55]);
      const n = U.randInt(6, 12);
      return { p, n, setup: R`In a certain city ${Math.round(p * 100)}% of voters support a ballot measure. A pollster phones ${n} voters chosen independently at random (the city is large).`,
        X: "the number of supporters reached", succ: "supporters", fail: "non-supporters",
        pWhy: R`\(p = ${p}\)` };
    },
  ];

  /* Hypergeometric stories: two kinds of object, draw without replacement. */
  const HG_CTX = [
    () => ({ w: U.randInt(5, 9), b: U.randInt(4, 9), white: "white", one: "white", black: "black", obj: "balls",
      setup: (w, b, n) => R`An urn contains ${w} white and ${b} black balls. ${n} balls are drawn at random without replacement.` }),
    () => ({ w: U.randInt(3, 6), b: U.randInt(10, 16), white: "defective", one: "defective", black: "working", obj: "bulbs",
      setup: (w, b, n) => R`A box of ${w + b} light bulbs contains ${w} defective ones. An inspector picks ${n} bulbs at random from the box to test (none is put back).` }),
    () => ({ w: U.randInt(6, 10), b: U.randInt(6, 10), white: "women", one: "a woman", black: "men", obj: "people",
      setup: (w, b, n) => R`A committee of ${n} is chosen at random from a department of ${w} women and ${b} men.` }),
    () => ({ w: U.randInt(4, 8), b: U.randInt(5, 10), white: "red", one: "red", black: "blue", obj: "marbles",
      setup: (w, b, n) => R`A bag holds ${w} red and ${b} blue marbles. You grab ${n} of them at random.` }),
  ];

  /* Random-variable-from-a-story contexts for PMF tables. */
  const PMF_CTX = [
    { X: "the number of students who show up for a professor's office hours on a given day", who: "students", verb: "show up", neg: "do not show up" },
    { X: "the number of the family's cars that need repairs this year", who: "cars", verb: "need repairs", neg: "do not need repairs" },
    { X: "the number of a team's starting players who score in a game", who: "starters", verb: "score", neg: "do not score" },
    { X: "the number of seats in a small shuttle van that are occupied on a trip", who: "seats", verb: "are occupied", neg: "are empty" },
  ];

  function randomPmfTable(minM = 4, maxM = 6) {
    const m = U.randInt(minM, maxM);
    const xs = Array.from({ length: m + 1 }, (_, i) => i);
    const ps = pmfHundredths(m + 1);
    return { m, xs, ps };
  }
  const pSum = (ps, lo, hi) => sum(ps.slice(lo, hi + 1));

  const generators = [
    /* ========== 1. Random variables and PMFs from a story ========== */
    MATH340.makeGenerator({
      id: "c3-gen-rv",
      name: "Random variables & their PMFs",
      blurb: "Turn an experiment into a random variable: support, PMF from outcomes, waiting times.",
      variants: [
        {
          name: "Sum of two dice",
          make() {
            const s = U.randInt(3, 11);
            const ways = 6 - Math.abs(s - 7);
            const ans = ways / 36;
            const pairs = [];
            for (let a = 1; a <= 6; a++) { const b = s - a; if (b >= 1 && b <= 6) pairs.push(`(${a},${b})`); }
            return {
              q: R`Two fair six-sided dice are rolled. Let \(S\) be the sum of the two numbers. Find \(P(S = ${s})\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">\(S\) is a function on the 36 equally likely ordered outcomes. The event \(\{S = ${s}\}\) is the set of outcomes that \(S\) maps to ${s}.</div>
                   <div class="sol-step">Those outcomes are ${pairs.join(", ")}: ${ways} of them.</div>
                   <div class="sol-step">$$P(S = ${s}) = \frac{${ways}}{36} ${ways % 36 ? R`= ${U.fracTex(ways, 36)}` : ""} \approx ${U.fmt(ans)}$$</div>`,
            };
          },
        },
        {
          name: "Maximum or minimum of two dice",
          make() {
            const m = U.randInt(1, 6);
            const isMax = Math.random() < 0.5;
            const ways = isMax ? 2 * m - 1 : 13 - 2 * m;
            const ans = ways / 36;
            return {
              q: R`Two fair six-sided dice are rolled. Let \(${isMax ? "M" : "L"}\) be the <b>${isMax ? "larger" : "smaller"}</b> of the two numbers (if they tie, that common value). Find \(P(${isMax ? "M" : "L"} = ${m})\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Count the ordered outcomes \((a, b)\) that the r.v. maps to ${m}: both dice ${isMax ? R`\(\le ${m}\)` : R`\(\ge ${m}\)`}, with at least one equal to ${m}.</div>
                   <div class="sol-step">${isMax
                     ? R`Both \(\le ${m}\): \(${m}^2\) outcomes. Both \(\le ${m - 1}\): \(${(m - 1) * (m - 1)}\). Difference: \(${m * m} - ${(m - 1) * (m - 1)} = ${ways}\).`
                     : R`Both \(\ge ${m}\): \(${7 - m}^2 = ${(7 - m) * (7 - m)}\) outcomes. Both \(\ge ${m + 1}\): \(${(6 - m) * (6 - m)}\). Difference: \(${ways}\).`}</div>
                   <div class="sol-step">$$P = \frac{${ways}}{36} \approx ${U.fmt(ans)}$$</div>`,
            };
          },
        },
        {
          name: "Heads minus tails",
          make() {
            const n = U.randInt(4, 8);
            const h = U.randInt(0, n);
            const d = 2 * h - n;
            const ans = U.choose(n, h) / Math.pow(2, n);
            return {
              q: R`A fair coin is tossed ${n} times. Let \(D\) = (number of heads) − (number of tails). Find \(P(D = ${d})\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Translate the value of \(D\) back into outcomes. With \(H\) heads there are \(${n} - H\) tails, so \(D = H - (${n} - H) = 2H - ${n}\).</div>
                   <div class="sol-step">\(D = ${d} \iff 2H - ${n} = ${d} \iff H = ${h}\).</div>
                   <div class="sol-step">$$P(D = ${d}) = P(H = ${h}) = \frac{\binom{${n}}{${h}}}{2^{${n}}} = \frac{${U.choose(n, h)}}{${Math.pow(2, n)}} \approx ${U.fmt(ans)}$$</div>`,
            };
          },
        },
        {
          name: "PMF from a list of outcomes",
          make() {
            const L = U.randInt(6, 9);
            const vals = Array.from({ length: L }, () => U.pick([0, 0, 0, 1, 1, 2, 2, 3]));
            const target = U.pick(vals);
            const atLeast = Math.random() < 0.4 && target > 0;
            const hits = vals.filter(v => (atLeast ? v >= target : v === target)).length;
            const ans = hits / L;
            const tbl = R`<table class="tbl"><tr><th>Lot</th>${vals.map((_, i) => `<td>${i + 1}</td>`).join("")}</tr>
              <tr><th>Defectives</th>${vals.map(v => `<td>${v}</td>`).join("")}</tr></table>`;
            return {
              q: R`${L} lots of components are ready to ship. The number of defective components in each lot:<br><br>${tbl}<br>One lot is selected at random; let \(X\) be the number of defectives in it. Find \(P(X ${atLeast ? R`\ge` : "="} ${target})\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Each <b>lot</b> is an equally likely outcome, and \(X\) maps each lot to its number of defectives. The PMF is (number of lots with that value) / ${L}.</div>
                   <div class="sol-step">Lots with ${atLeast ? R`\(X \ge ${target}\)` : R`\(X = ${target}\)`}: ${hits} of the ${L}.</div>
                   <div class="sol-step">$$P(X ${atLeast ? R`\ge` : "="} ${target}) = \frac{${hits}}{${L}} \approx ${U.fmt(ans)}$$</div>`,
            };
          },
        },
        {
          name: "Waiting time: PMF",
          make() {
            const p = U.pick([0.2, 0.25, 0.3, 0.4, 0.5, 0.6]);
            const k = U.randInt(2, 6);
            const ans = Math.pow(1 - p, k - 1) * p;
            return {
              q: R`An unfair coin lands tails with probability ${p}. It is tossed repeatedly until the first tail appears. Let \(X\) be the number of tosses needed (including the tail). Find \(P(X = ${k})\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">\(X = ${k}\) is the event "the first ${k - 1} tosses are heads and toss ${k} is a tail".</div>
                   <div class="sol-step">The tosses are independent, so multiply: $$P(X = ${k}) = (1 - ${p})^{${k - 1}} \cdot ${p} = (${U.fmt(1 - p, 2)})^{${k - 1}}(${p}) \approx ${U.fmt(ans)}$$</div>
                   <div class="sol-step">In general \(P(X = k) = (1 - p)^{k - 1} p\) for \(k = 1, 2, \dots\): a discrete r.v. with infinitely many values.</div>`,
            };
          },
        },
        {
          name: "Waiting time: tail probability",
          make() {
            const p = U.pick([0.2, 0.25, 0.3, 0.4, 0.5]);
            const k = U.randInt(2, 6);
            const strict = Math.random() < 0.5;
            const e = strict ? k : k - 1;
            const ans = Math.pow(1 - p, e);
            return {
              q: R`A basketball player keeps shooting until she makes a basket. Each shot goes in with probability ${p}, independently. Let \(X\) be the number of shots she takes. Find \(P(X ${strict ? ">" : R`\ge`} ${k})\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Don't sum the infinite tail. Ask what the event <em>means</em>: ${strict ? R`\(X > ${k}\)` : R`\(X \ge ${k}\)`} says the first ${e} shots all miss.</div>
                   <div class="sol-step">$$P(X ${strict ? ">" : R`\ge`} ${k}) = (1 - ${p})^{${e}} = (${U.fmt(1 - p, 2)})^{${e}} \approx ${U.fmt(ans)}$$</div>
                   <div class="sol-step">Mind the endpoint: \(X \ge ${k}\) is \(X > ${k - 1}\), so it needs only ${k - 1} misses, not ${k}.</div>`,
            };
          },
        },
        {
          name: "Size of the support",
          make() {
            const kind = U.randInt(0, 3);
            let q, ans, sol;
            if (kind === 0) {
              const n = U.randInt(3, 6);
              ans = 5 * n + 1;
              q = R`${n} fair dice are rolled and \(T\) is their total. How many possible values does \(T\) have?`;
              sol = R`<div class="sol-step">Find the smallest and largest values, then check nothing in between is skipped.</div>
                   <div class="sol-step">Smallest: \(${n}\) (all ones). Largest: \(${6 * n}\) (all sixes). Every integer between is reachable by raising one die at a time.</div>
                   <div class="sol-step">\(${6 * n} - ${n} + 1 = ${ans}\) values.</div>`;
            } else if (kind === 1) {
              ans = 6;
              q = R`Two fair dice are rolled and \(Y = |a - b|\) is the absolute difference of the two numbers. How many possible values does \(Y\) have?`;
              sol = R`<div class="sol-step">List the values: the smallest difference is \(0\) (a tie) and the largest is \(6 - 1 = 5\).</div>
                   <div class="sol-step">Support \(\{0, 1, 2, 3, 4, 5\}\): ${ans} values. (Many outcomes, but only 6 values — \(Y\) is not one-to-one.)</div>`;
            } else if (kind === 2) {
              const n = U.randInt(4, 9);
              ans = n + 1;
              q = R`A coin is tossed ${n} times. Let \(D\) = (number of heads) − (number of tails). How many possible values does \(D\) have?`;
              sol = R`<div class="sol-step">\(D = 2H - ${n}\) where \(H \in \{0, 1, \dots, ${n}\}\) is the number of heads.</div>
                   <div class="sol-step">Different \(H\) give different \(D\), so \(D\) has as many values as \(H\): \(${ans}\) (from \(-${n}\) to \(${n}\) in steps of 2).</div>`;
            } else {
              const w = U.randInt(3, 7), b = U.randInt(3, 7);
              const n = U.randInt(Math.max(w, b) - 1, w + b - 2);
              const lo = Math.max(0, n - b), hi = Math.min(n, w);
              ans = hi - lo + 1;
              q = R`An urn has ${w} white and ${b} black balls. ${n} balls are drawn without replacement, and \(X\) is the number of white balls drawn. How many possible values does \(X\) have?`;
              sol = R`<div class="sol-step">\(X \sim \text{HGeom}(${w}, ${b}, ${n})\), whose support is \(\max(0, n - b) \le k \le \min(n, w)\).</div>
                   <div class="sol-step">Smallest: \(\max(0, ${n} - ${b}) = ${lo}\)${n > b ? ` — with only ${b} black balls, at least ${n - b} of the ${n} draws must be white` : ""}. Largest: \(\min(${n}, ${w}) = ${hi}\).</div>
                   <div class="sol-step">\(${hi} - ${lo} + 1 = ${ans}\) values.</div>`;
            }
            return { q, answer: ans, kind: "count", sol };
          },
        },
      ],
    }),

    /* ========== 2. Probabilities from a PMF ========== */
    MATH340.makeGenerator({
      id: "c3-gen-pmf",
      name: "Probabilities from a PMF",
      blurb: "Read events off a PMF table: at least vs more than, ranges, missing values, constants.",
      variants: [
        {
          name: "At least vs. more than",
          make() {
            const c = U.pick(PMF_CTX);
            const { m, xs, ps } = randomPmfTable();
            const a = U.randInt(1, m - 1);
            const form = U.randInt(0, 3); // at least, more than, at most, fewer than
            const [lo, hi, words, sym] = [
              [a, m, `at least ${a}`, R`X \ge ${a}`],
              [a + 1, m, `more than ${a}`, R`X > ${a}`],
              [0, a, `at most ${a}`, R`X \le ${a}`],
              [0, a - 1, `fewer than ${a}`, R`X < ${a}`],
            ][form];
            const ans = pSum(ps, lo, hi) / 100;
            const vals = xs.slice(lo, hi + 1);
            return {
              q: R`Let \(X\) be ${c.X}. Its PMF is<br><br>${pmfTable(xs, ps.map(hund))}<br>What is the probability that <b>${words}</b> ${c.who} ${c.verb}?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Translate the words first: "${words}" is \(${sym}\), i.e. \(X \in \{${vals.join(", ")}\}\). ${form === 0 || form === 2 ? "The endpoint is included." : "The endpoint is excluded."}</div>
                   <div class="sol-step">$$P(${sym}) = ${vals.map(v => hund(ps[v])).join(" + ")} = ${U.fmt(ans, 2)}$$</div>`,
            };
          },
        },
        {
          name: "Inclusive vs. exclusive range",
          make() {
            const c = U.pick(PMF_CTX);
            const { m, xs, ps } = randomPmfTable(5, 6);
            const a = U.randInt(0, m - 3), b = U.randInt(a + 2, a === 0 ? m - 1 : m);
            const incl = Math.random() < 0.5;
            const lo = incl ? a : a + 1, hi = incl ? b : b - 1;
            const ans = pSum(ps, lo, hi) / 100;
            const sym = incl ? R`${a} \le X \le ${b}` : R`${a} < X < ${b}`;
            return {
              q: R`Let \(X\) be ${c.X}. Its PMF is<br><br>${pmfTable(xs, ps.map(hund))}<br>Find \(P(${sym})\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">${incl ? "Both endpoints are included" : "Both endpoints are excluded"}, so the values are \(\{${xs.slice(lo, hi + 1).join(", ")}\}\).</div>
                   <div class="sol-step">$$P(${sym}) = ${xs.slice(lo, hi + 1).map(v => hund(ps[v])).join(" + ")} = ${U.fmt(ans, 2)}$$</div>`,
            };
          },
        },
        {
          name: "Reframe: counting the ones who don't",
          make() {
            const c = U.pick(PMF_CTX);
            const { m, xs, ps } = randomPmfTable(4, 6);
            const j = U.randInt(1, m - 1);
            const ans = pSum(ps, 0, m - j) / 100;
            return {
              q: R`There are ${m} ${c.who} in total. Let \(X\) be the number of them that ${c.verb}; its PMF is<br><br>${pmfTable(xs, ps.map(hund))}<br>What is the probability that <b>at least ${j}</b> of the ${c.who} <b>${c.neg}</b>?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">The question counts the <em>other</em> group. If \(X\) ${c.verb}, then \(${m} - X\) ${c.neg}. Rewrite the event in terms of \(X\).</div>
                   <div class="sol-step">\(${m} - X \ge ${j} \iff X \le ${m - j}\).</div>
                   <div class="sol-step">$$P(X \le ${m - j}) = ${xs.slice(0, m - j + 1).map(v => hund(ps[v])).join(" + ")} = ${U.fmt(ans, 2)}$$</div>`,
            };
          },
        },
        {
          name: "Missing PMF value",
          make() {
            const { m, xs, ps } = randomPmfTable(3, 5);
            const i = U.randInt(0, m);
            const shown = ps.map((p, k) => (k === i ? "?" : hund(p)));
            const ans = ps[i] / 100;
            const X = U.pick(["the number of emails a support agent answers in a minute", "the number of heads showing on a handful of weighted coins", "the number of customers waiting when a bank opens"]);
            return {
              q: R`Let \(X\) be ${X}. Its PMF is given below, with one entry missing:<br><br>${pmfTable(xs, shown)}<br>Find \(P(X = ${i})\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">A valid PMF must <b>sum to 1</b> over the support.</div>
                   <div class="sol-step">$$P(X = ${i}) = 1 - (${ps.filter((_, k) => k !== i).map(hund).join(" + ")}) = 1 - ${hund(100 - ps[i])} = ${hund(ps[i])}$$</div>`,
            };
          },
        },
        {
          name: "Normalising constant",
          make() {
            const n = U.randInt(3, 6);
            const shape = U.randInt(0, 2);
            const f = [x => x, x => n + 1 - x, x => x * x][shape];
            const fTex = [R`c\,x`, R`c\,(${n + 1} - x)`, R`c\,x^2`][shape];
            const tot = sum(Array.from({ length: n }, (_, i) => f(i + 1)));
            const k = U.randInt(1, n);
            const ask = Math.random() < 0.5 ? "c" : "pk";
            const ans = ask === "c" ? 1 / tot : f(k) / tot;
            return {
              q: R`A random variable \(X\) has PMF \(p_X(x) = ${fTex}\) for \(x = 1, 2, \dots, ${n}\) (and \(0\) otherwise), where \(c\) is a constant. ${ask === "c" ? R`Find \(c\).` : R`Find \(P(X = ${k})\).`}`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">The only thing that pins down \(c\) is that a PMF <b>sums to 1</b>.</div>
                   <div class="sol-step">$$\sum_{x=1}^{${n}} p_X(x) = c\,(${Array.from({ length: n }, (_, i) => f(i + 1)).join(" + ")}) = ${tot}c = 1 \quad\Longrightarrow\quad c = \frac{1}{${tot}}$$</div>
                   ${ask === "c" ? "" : R`<div class="sol-step">$$P(X = ${k}) = \frac{${f(k)}}{${tot}} \approx ${U.fmt(ans)}$$</div>`}`,
            };
          },
        },
        {
          name: "Conditioning on the value of X",
          make() {
            const c = U.pick(PMF_CTX);
            const { m, xs, ps } = randomPmfTable(4, 6);
            const b = U.randInt(1, m - 1), a = U.randInt(b + 1, m);
            const num = pSum(ps, a, m), den = pSum(ps, b, m);
            const ans = num / den;
            return {
              q: R`Let \(X\) be ${c.X}. Its PMF is<br><br>${pmfTable(xs, ps.map(hund))}<br>Given that at least ${b} ${c.who} ${c.verb}, what is the probability that at least ${a} do? That is, find \(P(X \ge ${a} \mid X \ge ${b})\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Events about \(X\) are ordinary events, so the Chapter 2 definition applies. Here \(\{X \ge ${a}\} \subseteq \{X \ge ${b}\}\), so the intersection is just \(\{X \ge ${a}\}\).</div>
                   <div class="sol-step">$$P(X \ge ${a} \mid X \ge ${b}) = \frac{P(X \ge ${a})}{P(X \ge ${b})} = \frac{${hund(num)}}{${hund(den)}} \approx ${U.fmt(ans)}$$</div>`,
            };
          },
        },
        {
          name: "An event that is not an interval",
          make() {
            const { m, xs, ps } = randomPmfTable(4, 6);
            const even = Math.random() < 0.5;
            const vals = xs.filter(x => (x % 2 === 0) === even);
            const ans = sum(vals.map(v => ps[v])) / 100;
            return {
              q: R`A random variable \(X\) has the PMF below.<br><br>${pmfTable(xs, ps.map(hund))}<br>Find the probability that \(X\) is <b>${even ? "even" : "odd"}</b>.`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Any event about \(X\) is a set of values; add the PMF over that set. ${even ? "Remember that 0 is even." : ""}</div>
                   <div class="sol-step">$$P(X \in \{${vals.join(", ")}\}) = ${vals.map(v => hund(ps[v])).join(" + ")} = ${U.fmt(ans, 2)}$$</div>`,
            };
          },
        },
      ],
    }),

    /* ========== 3. Working with a CDF ========== */
    MATH340.makeGenerator({
      id: "c3-gen-cdf",
      name: "Working with a CDF",
      blurb: "Jumps are point masses, F(b) − F(a), endpoints, building a CDF from a PMF.",
      variants: [
        {
          name: "Jump size = point mass",
          make() {
            const C = stepCdf();
            const i = U.randInt(0, C.k - 1);
            const ans = C.ps[i] / 100;
            return {
              q: R`A discrete random variable \(X\) has CDF ${C.tex} Find \(P(X = ${C.xs[i]})\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">\(P(X = x)\) is the <b>size of the jump</b> of \(F\) at \(x\): \(F(x) - F(x^-)\).</div>
                   <div class="sol-step">$$P(X = ${C.xs[i]}) = F(${C.xs[i]}) - F(${C.xs[i]}^-) = ${hund(C.F[i])} - ${hund(C.Fleft(i))} = ${hund(C.ps[i])}$$</div>`,
            };
          },
        },
        {
          name: "Is there a jump here?",
          make() {
            const C = stepCdf();
            // a point strictly between two jumps, or a jump point, 50/50
            const onJump = Math.random() < 0.35;
            let x, ans;
            if (onJump) {
              const i = U.randInt(0, C.k - 1);
              x = C.xs[i]; ans = C.ps[i] / 100;
            } else {
              const i = U.randInt(0, C.k - 2);
              x = (C.xs[i] + C.xs[i + 1]) / 2;
              ans = 0;
            }
            return {
              q: R`A random variable \(X\) has CDF ${C.tex} Find \(P(X = ${x})\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Look for a jump of \(F\) at \(x = ${x}\). \(P(X = x) = F(x) - F(x^-)\).</div>
                   <div class="sol-step">${onJump
                     ? R`\(F\) jumps from \(${hund(C.Fat(x) - Math.round(ans * 100))}\) to \(${hund(C.Fat(x))}\) at \(${x}\), so \(P(X = ${x}) = ${U.fmt(ans, 2)}\).`
                     : R`\(${x}\) lies strictly inside a flat piece of \(F\) (\(F = ${hund(C.Fat(x))}\) on both sides), so there is no jump and \(P(X = ${x}) = 0\). The value of \(F\) there is not a point probability.`}</div>`,
            };
          },
        },
        {
          name: "F(b) − F(a)",
          make() {
            const C = stepCdf();
            const i = U.randInt(0, C.k - 2), j = U.randInt(i + 1, C.k - 1);
            const a = C.xs[i], b = C.xs[j];
            const ans = (C.F[j] - C.F[i]) / 100;
            return {
              q: R`A random variable \(X\) has CDF ${C.tex} Find \(P(${a} < X \le ${b})\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">\(<\) on the left and \(\le\) on the right is exactly the shape \(F(b) - F(a)\) counts.</div>
                   <div class="sol-step">$$P(${a} < X \le ${b}) = F(${b}) - F(${a}) = ${hund(C.F[j])} - ${hund(C.F[i])} = ${U.fmt(ans, 2)}$$</div>`,
            };
          },
        },
        {
          name: "Endpoints included or excluded",
          make() {
            const C = stepCdf();
            const i = U.randInt(0, C.k - 2), j = U.randInt(i + 1, C.k - 1);
            const a = C.xs[i], b = C.xs[j];
            let form = U.randInt(0, 2);
            if (form === 0 && i === 0 && j === C.k - 1) form = 1;  // the whole support would give 1
            // [lower F, upper F, symbol, explanation]
            const cfg = [
              [C.Fleft(i), C.F[j], R`${a} \le X \le ${b}`, R`Including \(${a}\) means subtracting \(F(${a}^-)\), the value just <em>before</em> the jump at \(${a}\).`],
              [C.F[i], C.Fleft(j), R`${a} < X < ${b}`, R`Excluding \(${b}\) means using \(F(${b}^-)\), the value just <em>before</em> the jump at \(${b}\).`],
              [C.Fleft(i), C.Fleft(j), R`${a} \le X < ${b}`, R`Include \(${a}\): subtract \(F(${a}^-)\). Exclude \(${b}\): use \(F(${b}^-)\).`],
            ][form];
            const ans = (cfg[1] - cfg[0]) / 100;
            return {
              q: R`A random variable \(X\) has CDF ${C.tex} Find \(P(${cfg[2]})\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Start from \(F(b) - F(a)\), which counts \(a < X \le b\), and fix each endpoint that differs. ${cfg[3]}</div>
                   <div class="sol-step">$$P(${cfg[2]}) = ${hund(cfg[1])} - ${hund(cfg[0])} = ${U.fmt(ans, 2)}$$</div>
                   <div class="sol-step">Check with jumps: add the masses at the values of \(X\) inside the range.</div>`,
            };
          },
        },
        {
          name: "Upper tail",
          make() {
            const C = stepCdf();
            const strict = Math.random() < 0.5;
            const i = U.randInt(strict ? 0 : 1, C.k - 2);
            const a = C.xs[i];
            const ans = strict ? (100 - C.F[i]) / 100 : (100 - C.Fleft(i)) / 100;
            return {
              q: R`A random variable \(X\) has CDF ${C.tex} Find \(P(X ${strict ? ">" : R`\ge`} ${a})\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Complement: ${strict ? R`\(P(X > a) = 1 - P(X \le a) = 1 - F(a)\).` : R`\(P(X \ge a) = 1 - P(X < a) = 1 - F(a^-)\) — the value just before the jump.`}</div>
                   <div class="sol-step">$$P(X ${strict ? ">" : R`\ge`} ${a}) = 1 - ${strict ? hund(C.F[i]) : hund(C.Fleft(i))} = ${U.fmt(ans, 2)}$$</div>`,
            };
          },
        },
        {
          name: "Build the CDF from a PMF",
          make() {
            const drives = [1, 2, 4, 8, 16];
            const ps = pmfHundredths(5);
            const y = U.pick([1, 2, 3, 4, 5, 6, 8, 10, 12, 20]);
            let F = 0; const used = [];
            drives.forEach((d, i) => { if (d <= y) { F += ps[i]; used.push(i); } });
            const ans = F / 100;
            return {
              q: R`A store sells flash drives with 1, 2, 4, 8, or 16 GB of memory. Let \(Y\) be the memory of a purchased drive, with PMF<br><br>${pmfTable(drives, ps.map(hund), "y", R`p_Y(y)`)}<br>Find the CDF value \(F_Y(${y})\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">\(F_Y(y) = P(Y \le y)\): add the PMF at every support value \(\le ${y}\). The CDF is defined for <em>all</em> real \(y\), not just the support.</div>
                   <div class="sol-step">Values \(\le ${y}\): \(\{${used.map(i => drives[i]).join(", ")}\}\).</div>
                   <div class="sol-step">$$F_Y(${y}) = ${used.map(i => hund(ps[i])).join(" + ")} = ${U.fmt(ans, 2)}$$</div>`,
            };
          },
        },
        {
          name: "Reading a percentile off the CDF",
          make() {
            const C = stepCdf();
            const q = U.pick([0.25, 0.5, 0.75, 0.9]);
            const i = C.F.findIndex(v => v >= q * 100);
            const ans = C.xs[i];
            return {
              q: R`A random variable \(X\) has CDF ${C.tex} What is the smallest value \(x\) with \(F(x) \ge ${q}\)?${q === 0.5 ? " (This is the median of \\(X\\).)" : ""}`,
              answer: ans, kind: "num", tol: 0.001,
              sol: R`<div class="sol-step">Walk up the steps of \(F\) until it first reaches \(${q}\).</div>
                   <div class="sol-step">${C.xs.slice(0, i + 1).map((x, t) => R`\(F(${x}) = ${hund(C.F[t])}\)`).join(", ")}. The first value \(\ge ${q}\) is at \(x = ${ans}\).</div>`,
            };
          },
        },
      ],
    }),

    /* ========== 4. Binomial ========== */
    MATH340.makeGenerator({
      id: "c3-gen-binom",
      name: "Binomial distribution",
      blurb: "Fixed n independent trials with constant p: exactly, at least, at most, failures.",
      variants: [
        {
          name: "Exactly k successes",
          make: sane(function () {
            const c = U.pick(BIN_CTX)();
            const k = U.randInt(2, c.n - 1);
            const ans = binPmf(c.n, k, c.p);
            return {
              q: R`${c.setup} Let \(X\) be ${c.X}. What is the probability of exactly ${k} ${c.succ}?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Fixed number of independent trials, each a success or failure with the same probability: \(X \sim \text{Bin}(${c.n}, p)\) with ${c.pWhy}.</div>
                   <div class="sol-step">$$P(X = ${k}) = ${binTex(c.n, k, c.p)} \approx ${U.fmt(ans)}$$</div>
                   <div class="sol-step">\(\binom{${c.n}}{${k}} = ${U.choose(c.n, k)}\) counts which trials are the successes; each such sequence has the same probability.</div>`,
            };
          }),
        },
        {
          name: "At least one (complement)",
          make: sane(function () {
            const c = U.pick(BIN_CTX)();
            const ans = 1 - Math.pow(1 - c.p, c.n);
            return {
              q: R`${c.setup} Let \(X\) be ${c.X}. Find \(P(X \ge 1)\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">"At least one" has ${c.n} terms; its complement, \(X = 0\), has one.</div>
                   <div class="sol-step">$$P(X \ge 1) = 1 - P(X = 0) = 1 - (${U.fmt(1 - c.p, 2)})^{${c.n}} \approx ${U.fmt(ans)}$$</div>`,
            };
          }),
        },
        {
          name: "At most k (sum of terms)",
          make: sane(function () {
            const c = U.pick(BIN_CTX)();
            const k = U.randInt(1, Math.min(3, c.n - 2));
            let ans = 0; const terms = [];
            for (let j = 0; j <= k; j++) { ans += binPmf(c.n, j, c.p); terms.push(U.fmt(binPmf(c.n, j, c.p), 4)); }
            return {
              q: R`${c.setup} Let \(X\) be ${c.X}. Find the probability of <b>at most ${k}</b> ${c.succ}.`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">\(X \sim \text{Bin}(${c.n}, ${U.fmt(c.p, 2)})\) (${c.pWhy}). "At most ${k}" is \(X \le ${k}\): add the PMF for \(k = 0, \dots, ${k}\).</div>
                   <div class="sol-step">$$P(X \le ${k}) = \sum_{j=0}^{${k}} \binom{${c.n}}{j}(${U.fmt(c.p, 2)})^j(${U.fmt(1 - c.p, 2)})^{${c.n} - j}$$</div>
                   <div class="sol-step">$$= ${terms.join(" + ")} \approx ${U.fmt(ans)}$$ This is the CDF value \(F_X(${k})\).</div>`,
            };
          }),
        },
        {
          name: "At least k (complement of a short sum)",
          make: sane(function () {
            const c = U.pick(BIN_CTX)();
            const k = U.randInt(2, 3);
            let low = 0; const terms = [];
            for (let j = 0; j < k; j++) { low += binPmf(c.n, j, c.p); terms.push(U.fmt(binPmf(c.n, j, c.p), 4)); }
            const ans = 1 - low;
            return {
              q: R`${c.setup} Let \(X\) be ${c.X}. Find the probability of <b>at least ${k}</b> ${c.succ}.`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">\(P(X \ge ${k})\) has \(${c.n - k + 1}\) terms; the complement \(X \le ${k - 1}\) has only ${k}. Go through the complement.</div>
                   <div class="sol-step">$$P(X \le ${k - 1}) = ${terms.join(" + ")} \approx ${U.fmt(low)}$$</div>
                   <div class="sol-step">$$P(X \ge ${k}) = 1 - ${U.fmt(low)} \approx ${U.fmt(ans)}$$</div>`,
            };
          }),
        },
        {
          name: "Counting failures instead",
          make: sane(function () {
            const c = U.pick(BIN_CTX)();
            const j = U.randInt(2, c.n - 1);
            const ans = binPmf(c.n, c.n - j, c.p);
            return {
              q: R`${c.setup} What is the probability of exactly ${j} ${c.fail}?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">The number of failures is \(${c.n} - X \sim \text{Bin}(${c.n}, 1 - p)\), where \(X\) is ${c.X} and ${c.pWhy}.</div>
                   <div class="sol-step">Exactly ${j} failures \(\iff X = ${c.n - j}\): $$P = \binom{${c.n}}{${j}}(${U.fmt(1 - c.p, 2)})^{${j}}(${U.fmt(c.p, 2)})^{${c.n - j}} \approx ${U.fmt(ans)}$$</div>
                   <div class="sol-step">A common slip is plugging \(k = ${j}\) into the success PMF, which answers a different question.</div>`,
            };
          }),
        },
        {
          name: "The k-th success on the last trial",
          make: sane(function () {
            const c = U.pick(BIN_CTX)();
            const k = U.randInt(2, Math.min(4, c.n - 1));
            const ans = U.choose(c.n - 1, k - 1) * Math.pow(c.p, k) * Math.pow(1 - c.p, c.n - k);
            return {
              q: R`${c.setup} What is the probability that there are exactly ${k} ${c.succ} <b>and the last one happens on trial ${c.n}</b> (the final trial is a success)?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">The last trial is pinned down, so only the first \(${c.n - 1}\) trials are free: they must contain exactly \(${k - 1}\) ${U.plural(k - 1, "success", "successes")}.</div>
                   <div class="sol-step">By independence, multiply by the last success: $$\binom{${c.n - 1}}{${k - 1}}(${U.fmt(c.p, 2)})^{${k - 1}}(${U.fmt(1 - c.p, 2)})^{${c.n - k}} \cdot ${U.fmt(c.p, 2)} \approx ${U.fmt(ans)}$$</div>
                   <div class="sol-step">Compare \(P(X = ${k}) = \binom{${c.n}}{${k}}\cdots\): fixing a position reduces \(\binom{${c.n}}{${k}}\) to \(\binom{${c.n - 1}}{${k - 1}}\).</div>`,
            };
          }),
        },
        {
          name: "Which trials? Conditioning on the total",
          make: sane(function () {
            const c = U.pick(BIN_CTX)();
            const k = U.randInt(2, c.n - 1);
            const ans = k / c.n;
            return {
              q: R`${c.setup} Given that there were exactly ${k} ${c.succ} in total, what is the probability that the <b>first</b> trial was one of them?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Given \(X = ${k}\), every arrangement of ${k} successes among ${c.n} trials has the same probability \(p^{${k}}q^{${c.n - k}}\), so all \(\binom{${c.n}}{${k}}\) arrangements are <b>equally likely</b> and \(p\) drops out.</div>
                   <div class="sol-step">$$P(\text{trial 1 success} \mid X = ${k}) = \frac{p \cdot \binom{${c.n - 1}}{${k - 1}} p^{${k - 1}}q^{${c.n - k}}}{\binom{${c.n}}{${k}} p^{${k}} q^{${c.n - k}}} = \frac{\binom{${c.n - 1}}{${k - 1}}}{\binom{${c.n}}{${k}}} = \frac{${k}}{${c.n}} \approx ${U.fmt(ans)}$$</div>`,
            };
          }),
        },
        {
          name: "Urn with replacement",
          make: sane(function () {
            const w = U.randInt(3, 8), b = U.randInt(3, 8);
            const n = U.randInt(4, 7);
            const k = U.randInt(2, n - 1);
            const p = w / (w + b);
            const ans = binPmf(n, k, p);
            return {
              q: R`An urn contains ${w} white and ${b} black balls. A ball is drawn at random, its colour noted, and it is <b>put back</b>; this is done ${n} times. Find the probability that exactly ${k} white balls are observed.`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step"><b>With replacement</b> the urn is the same before every draw, so the draws are independent with constant \(p = \frac{${w}}{${w + b}}\): \(X \sim \text{Bin}\left(${n}, \frac{${w}}{${w + b}}\right)\), not Hypergeometric.</div>
                   <div class="sol-step">$$P(X = ${k}) = \binom{${n}}{${k}}\left(\frac{${w}}{${w + b}}\right)^{${k}}\left(\frac{${b}}{${w + b}}\right)^{${n - k}} \approx ${U.fmt(ans)}$$</div>`,
            };
          }),
        },
      ],
    }),

    /* ========== 5. Hypergeometric ========== */
    MATH340.makeGenerator({
      id: "c3-gen-hgeom",
      name: "Hypergeometric distribution",
      blurb: "Sampling without replacement: urns, committees, capture–recapture, card hands, support.",
      variants: [
        {
          name: "Exactly k of one type",
          make: sane(function () {
            const c = U.pick(HG_CTX)();
            const n = U.randInt(3, Math.min(6, c.w + c.b - 2));
            const lo = Math.max(0, n - c.b), hi = Math.min(n, c.w);
            const k = U.randInt(Math.max(lo, 1), hi);
            const ans = hgeomPmf(c.w, c.b, n, k);
            return {
              q: R`${c.setup(c.w, c.b, n)} Find the probability that exactly ${k} of the selected ${c.obj} are ${c.white}.`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Two types, a fixed sample, <b>no replacement</b>: the number of ${c.white} is \(X \sim \text{HGeom}(${c.w}, ${c.b}, ${n})\).</div>
                   <div class="sol-step">Choose the ${k} ${c.white} and, separately, the other ${n - k} from the ${c.black}; divide by all samples of size ${n}.</div>
                   <div class="sol-step">$$P(X = ${k}) = ${hgTex(c.w, c.b, n, k)} = \frac{${U.choose(c.w, k)} \cdot ${U.choose(c.b, n - k)}}{${U.choose(c.w + c.b, n)}} \approx ${U.fmt(ans)}$$</div>`,
            };
          }),
        },
        {
          name: "Capture–recapture",
          make: sane(function () {
            const [N, m, n] = U.pick([[400, 40, 50], [300, 30, 40], [500, 50, 40], [200, 25, 30], [250, 20, 40], [600, 60, 50]]);
            const k = U.randInt(1, 6);
            const ans = hgeomPmf(m, N - m, n, k);
            const animal = U.pick([["elk", "forest"], ["fish", "lake"], ["deer", "reserve"], ["turtles", "pond"]]);
            return {
              q: R`A ${animal[1]} has ${N} ${animal[0]}. Yesterday ${m} were captured, tagged, and released. Today ${n} are captured at random, each subset of ${n} equally likely. What is the probability that exactly ${k} of today's ${animal[0]} are tagged?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Tagged ${animal[0]} are the "white balls" (\(w = ${m}\)) and untagged the "black balls" (\(b = ${N - m}\)). Today's catch is \(n = ${n}\) drawn without replacement: \(X \sim \text{HGeom}(${m}, ${N - m}, ${n})\).</div>
                   <div class="sol-step">$$P(X = ${k}) = ${hgTex(m, N - m, n, k)} \approx ${U.fmt(ans)}$$</div>
                   <div class="sol-step">Numbers this large need a calculator or software. Setting up the right ratio is the part the exam tests.</div>`,
            };
          }),
        },
        {
          name: "Card hands",
          make: sane(function () {
            const kind = U.pick(["hearts", "aces", "face cards"]);
            const w = kind === "hearts" ? 13 : kind === "aces" ? 4 : 12;
            const n = U.pick([5, 5, 13]);
            const k = U.randInt(kind === "aces" ? 1 : 1, Math.min(kind === "aces" ? 3 : 4, n));
            const ans = hgeomPmf(w, 52 - w, n, k);
            return {
              q: R`A ${n}-card hand is dealt from a well-shuffled standard 52-card deck. Find the probability that the hand contains exactly ${k} ${kind}.`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">There are ${w} ${kind} (the "white balls") and \(${52 - w}\) other cards. A hand is a draw without replacement: \(X \sim \text{HGeom}(${w}, ${52 - w}, ${n})\).</div>
                   <div class="sol-step">$$P(X = ${k}) = ${hgTex(w, 52 - w, n, k)} \approx ${U.fmt(ans)}$$</div>`,
            };
          }),
        },
        {
          name: "At least one (complement)",
          make: sane(function () {
            const c = U.pick(HG_CTX)();
            const n = U.randInt(3, Math.min(6, c.b));
            const p0 = hgeomPmf(c.w, c.b, n, 0);
            const ans = 1 - p0;
            return {
              q: R`${c.setup(c.w, c.b, n)} Find the probability that <b>at least one</b> of the selected ${c.obj} is ${c.one}.`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Complement: "none are ${c.white}" means all ${n} come from the ${c.b} ${c.black}.</div>
                   <div class="sol-step">$$P(X = 0) = \frac{\binom{${c.b}}{${n}}}{\binom{${c.w + c.b}}{${n}}} = \frac{${U.choose(c.b, n)}}{${U.choose(c.w + c.b, n)}} \approx ${U.fmt(p0)}$$</div>
                   <div class="sol-step">$$P(X \ge 1) = 1 - ${U.fmt(p0)} \approx ${U.fmt(ans)}$$</div>`,
            };
          }),
        },
        {
          name: "Acceptance sampling (at most c)",
          make: sane(function () {
            const N = U.pick([20, 25, 30]), D = U.randInt(3, 6), n = U.randInt(4, 6), c = U.randInt(0, 1);
            let ans = 0; const terms = [];
            for (let j = 0; j <= c; j++) { ans += hgeomPmf(D, N - D, n, j); terms.push(hgTex(D, N - D, n, j)); }
            return {
              q: R`A shipment of ${N} circuit boards contains ${D} defective boards. The buyer tests ${n} boards chosen at random (without replacement) and accepts the shipment if <b>${c === 0 ? "none" : "at most one"}</b> of them is defective. What is the probability the shipment is accepted?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Number of defectives tested: \(X \sim \text{HGeom}(${D}, ${N - D}, ${n})\). Accept \(\iff X \le ${c}\).</div>
                   <div class="sol-step">$$P(X \le ${c}) = ${terms.join(" + ")} \approx ${U.fmt(ans)}$$</div>`,
            };
          }),
        },
        {
          name: "Check the support first",
          make() {
            const w = U.randInt(4, 8), b = U.randInt(3, 5);
            const n = U.randInt(b + 1, Math.min(w + b - 1, b + 4));
            const lo = n - b, hi = Math.min(n, w);
            const inside = Math.random() < 0.5;
            const k = inside ? U.randInt(lo, hi) : U.randInt(0, lo - 1);
            const ans = hgeomPmf(w, b, n, k);
            return {
              q: R`An urn contains ${w} white and ${b} black balls. ${n} balls are drawn without replacement. Find the probability that exactly ${k} of them are white.`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Before using the formula, check that \(k = ${k}\) is possible. The draw has ${n - k} black balls, and there are only ${b} black balls in the urn.</div>
                   <div class="sol-step">${inside
                     ? R`\(${n - k} \le ${b}\), so it is possible: $$P(X = ${k}) = ${hgTex(w, b, n, k)} \approx ${U.fmt(ans)}$$`
                     : R`\(${n - k} > ${b}\): impossible. At least \(${n} - ${b} = ${lo}\) of the draws must be white, so \(P(X = ${k}) = 0\). (The formula agrees, since \(\binom{${b}}{${n - k}} = 0\).)`}</div>`,
            };
          },
        },
        {
          name: "Counting the other type",
          make: sane(function () {
            const c = U.pick(HG_CTX)();
            const n = U.randInt(3, Math.min(6, c.w + c.b - 2));
            const lo = Math.max(0, n - c.w), hi = Math.min(n, c.b);
            const j = U.randInt(Math.max(lo, 1), hi);
            const ans = hgeomPmf(c.b, c.w, n, j);
            return {
              q: R`${c.setup(c.w, c.b, n)} Find the probability that exactly ${j} of the selected ${c.obj} are ${c.black}.`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Either relabel (the ${c.black} are now the "white balls": \(\text{HGeom}(${c.b}, ${c.w}, ${n})\)) or note that ${j} ${c.black} means \(${n - j}\) ${c.white}.</div>
                   <div class="sol-step">$$P = \frac{\binom{${c.b}}{${j}}\binom{${c.w}}{${n - j}}}{\binom{${c.w + c.b}}{${n}}} = \frac{${U.choose(c.b, j)} \cdot ${U.choose(c.w, n - j)}}{${U.choose(c.w + c.b, n)}} \approx ${U.fmt(ans)}$$</div>
                   <div class="sol-step">Pair each \(\binom{\cdot}{\cdot}\) with its own group: the number chosen from a group sits under that group's size.</div>`,
            };
          }),
        },
      ],
    }),
  ];

  /* ---------------- how to choose a method ---------------- */
  const methodGuide = [
    {
      when: R`"let \(X\) be the number of…", "the sum / maximum / difference of…"`,
      use: R`Define the r.v., list its support, then find the PMF`,
      why: R`\(\{X = x\}\) is an event: the outcomes that \(X\) sends to \(x\). Count those outcomes (or use a named distribution). Writing the support first catches impossible values.`,
    },
    {
      when: R`a PMF with an unknown constant \(c\), or a missing table entry`,
      use: R`\(\sum_x p_X(x) = 1\)`,
      why: R`That is the only condition that involves \(c\). Also check that no value comes out negative.`,
    },
    {
      when: R`"at least", "more than", "at most", "fewer than", "between"`,
      use: R`Translate to \(\ge, >, \le, <\) first, then add PMF values`,
      why: R`Most lost marks on PMF questions come from the endpoint. For a count, "more than 2" starts at 3. Use the complement when it has fewer terms.`,
    },
    {
      when: R`"at least \(j\) do <em>not</em>…" when \(X\) counts those who do`,
      use: R`Rewrite with \(n - X\)`,
      why: R`\(n - X \ge j \iff X \le n - j\). Change the event, not the table.`,
    },
    {
      when: R`a CDF is given and you want \(P(X = x)\)`,
      use: R`Jump size \(F(x) - F(x^-)\)`,
      why: R`The value \(F(x)\) itself is cumulative. A point with no jump has probability \(0\).`,
    },
    {
      when: R`a CDF is given and you want an interval probability`,
      use: R`\(P(a < X \le b) = F(b) - F(a)\); adjust endpoints with \(F(\cdot^-)\)`,
      why: R`Including the left endpoint means subtracting \(F(a^-)\). Excluding the right endpoint means using \(F(b^-)\). Upper tails: \(1 - F(a)\).`,
    },
    {
      when: R`fixed number of independent trials, same success chance each time, "how many succeed"`,
      use: R`\(\text{Bin}(n, p)\): \(\binom{n}{k}p^k(1-p)^{n-k}\)`,
      why: R`Check all four conditions (fixed \(n\), two outcomes, independent, constant \(p\)). A rate such as "8 out of 16" is how \(p\) is given.`,
    },
    {
      when: R`Binomial with "at least one", or "at least \(k\)" for small \(k\)`,
      use: R`Complement: \(1 - P(X \le k - 1)\)`,
      why: R`\(P(X \ge 1) = 1 - (1-p)^n\) is one term instead of \(n\).`,
    },
    {
      when: R`two kinds of object, a sample drawn <b>without replacement</b> (committee, hand of cards, lot inspection, tagged animals)`,
      use: R`\(\text{HGeom}(w, b, n)\): \(\binom{w}{k}\binom{b}{n-k} / \binom{w+b}{n}\)`,
      why: R`The draws are dependent and the success chance changes. Check the support \(\max(0, n-b) \le k \le \min(n, w)\) before computing.`,
    },
    {
      when: R`an urn, but "with replacement", "put back", or a population so large it doesn't matter`,
      use: R`Binomial with \(p = \frac{w}{w+b}\)`,
      why: R`With replacement the urn is unchanged before every draw, so the draws are independent with constant \(p\). That is what separates Binomial from Hypergeometric.`,
    },
    {
      when: R`"until the first success", "keeps trying until…"`,
      use: R`\(P(X = k) = (1-p)^{k-1}p\); \(P(X > k) = (1-p)^k\)`,
      why: R`\(X > k\) just means the first \(k\) tries all fail, so there is no infinite sum.`,
    },
  ];

  MATH340.registerUnit({
    id: "ch3",
    title: "Chapter 3 · Random Variables & Distributions",
    short: "Ch 3 · RVs",
    week: 3,
    order: 3,
    description: "Random variables, PMFs and CDFs, the Bernoulli and Binomial distributions, the Hypergeometric distribution, and when to use each.",
    flashcards,
    generators,
    methodGuide,
  });
})();
