/* ============================================================
 * Chapter 2 — Conditional Probability  (Week 2)
 * Source: class lecture notes (C2) + Blitzstein & Hwang ch. 2
 * ============================================================ */
(function () {
  const U = MATH340.util;
  const R = String.raw;

  const flashcards = [
    {
      id: "c2-cond-def", tag: "Definition 2.2.1",
      front: R`State the definition of the <em>conditional probability</em> of \(A\) given \(B\).`,
      back: R`For events with \(P(B) > 0\), $$P(A \mid B) = \frac{P(A \cap B)}{P(B)}.$$ Intuition: restrict the sample space to \(B\) and renormalize.`,
    },
    {
      id: "c2-intersect2", tag: "Theorem 2.3.1",
      front: R`Express \(P(A \cap B)\) using conditional probabilities (two ways).`,
      back: R`$$P(A \cap B) = P(B)\,P(A \mid B) = P(A)\,P(B \mid A)$$`,
    },
    {
      id: "c2-chain", tag: "Theorem 2.3.2",
      front: R`State the chain rule for the probability of the intersection of \(n\) events \(A_1, \dots, A_n\).`,
      back: R`$$P(A_1, A_2, \dots, A_n) = P(A_1)\,P(A_2 \mid A_1)\,P(A_3 \mid A_1, A_2)\cdots P(A_n \mid A_1, \dots, A_{n-1})$$ (Commas denote intersections.)`,
    },
    {
      id: "c2-bayes", tag: "Theorem 2.3.3",
      front: R`State <em>Bayes' rule</em>.`,
      back: R`For events with positive probabilities, $$P(A \mid B) = \frac{P(B \mid A)\,P(A)}{P(B)}.$$ It "flips" the direction of conditioning.`,
    },
    {
      id: "c2-odds", tag: "Definition 2.3.4",
      front: R`Define the <em>odds</em> of an event \(A\).`,
      back: R`$$\text{odds}(A) = \frac{P(A)}{P(A^c)}$$ E.g. \(P(A) = 3/4\) gives odds \(3\) ("3 to 1 in favor").`,
    },
    {
      id: "c2-odds-bayes", tag: "Theorem 2.3.5",
      front: R`State the <em>odds form</em> of Bayes' rule.`,
      back: R`$$\underbrace{\frac{P(A \mid B)}{P(A^c \mid B)}}_{\text{posterior odds}} = \underbrace{\frac{P(B \mid A)}{P(B \mid A^c)}}_{\text{likelihood ratio}} \cdot \underbrace{\frac{P(A)}{P(A^c)}}_{\text{prior odds}}$$`,
    },
    {
      id: "c2-lotp", tag: "Theorem 2.3.6",
      front: R`State the <em>law of total probability</em> (LOTP).`,
      back: R`If \(A_1, \dots, A_n\) partition \(S\) (disjoint, union \(= S\), each \(P(A_i) > 0\)), then $$P(B) = \sum_{i=1}^{n} P(B \mid A_i)\,P(A_i).$$`,
    },
    {
      id: "c2-lotp2", tag: "Two-group LOTP",
      front: R`Write the law of total probability for the partition \(\{A, A^c\}\).`,
      back: R`$$P(B) = P(B \mid A)\,P(A) + P(B \mid A^c)\,P(A^c)$$ This is the denominator you almost always need in Bayes' rule problems.`,
    },
    {
      id: "c2-condprob-are-prob", tag: "Section 2.4",
      front: R`"Conditional probabilities are probabilities." What does this mean in practice?`,
      back: R`With the conditioning event \(E\) fixed, \(P(\cdot \mid E)\) satisfies all the usual axioms and rules:<br>\(P(A^c \mid E) = 1 - P(A \mid E)\),<br>\(P(A \cup B \mid E) = P(A \mid E) + P(B \mid E) - P(A \cap B \mid E)\), etc.`,
    },
    {
      id: "c2-bayes-extra", tag: "Theorem 2.4.2",
      front: R`State Bayes' rule <em>with extra conditioning</em> on an event \(E\).`,
      back: R`$$P(A \mid B, E) = \frac{P(B \mid A, E)\,P(A \mid E)}{P(B \mid E)}$$ Everything is conditioned on \(E\) throughout.`,
    },
    {
      id: "c2-lotp-extra", tag: "Theorem 2.4.3",
      front: R`State the law of total probability <em>with extra conditioning</em> on \(E\).`,
      back: R`For a partition \(A_1, \dots, A_n\) of \(S\) with \(P(A_i \cap E) > 0\): $$P(B \mid E) = \sum_{i=1}^{n} P(B \mid A_i, E)\,P(A_i \mid E)$$`,
    },
    {
      id: "c2-indep", tag: "Definition 2.5.1",
      front: R`Define <em>independence</em> of two events \(A\) and \(B\), and give the equivalent conditional forms.`,
      back: R`$$P(A \cap B) = P(A)\,P(B)$$ If \(P(A) > 0\) and \(P(B) > 0\), equivalently \(P(A \mid B) = P(A)\) and \(P(B \mid A) = P(B)\): learning one gives no information about the other.`,
    },
    {
      id: "c2-indep-vs-disjoint", tag: "Common pitfall",
      front: R`Are disjoint events independent?`,
      back: R`<b>Essentially never.</b> If \(A \cap B = \emptyset\) then \(P(A \cap B) = 0\), so they can only be independent if \(P(A) = 0\) or \(P(B) = 0\). Knowing \(A\) happened tells you \(B\) definitely did not — that is information, i.e. dependence.`,
    },
    {
      id: "c2-indep-comp", tag: "Proposition 2.5.3",
      front: R`If \(A\) and \(B\) are independent, what about their complements?`,
      back: R`Then \(A\) &amp; \(B^c\), \(A^c\) &amp; \(B\), and \(A^c\) &amp; \(B^c\) are <b>all independent</b> too.`,
    },
    {
      id: "c2-indep3", tag: "Definition 2.5.4",
      front: R`What is required for three events \(A, B, C\) to be independent?`,
      back: R`All four equations:$$\begin{aligned}P(A \cap B) &= P(A)P(B), \quad P(A \cap C) = P(A)P(C),\\ P(B \cap C) &= P(B)P(C), \quad P(A \cap B \cap C) = P(A)P(B)P(C).\end{aligned}$$ Pairwise independence alone is <b>not</b> enough.`,
    },
    {
      id: "c2-cond-indep", tag: "Definition 2.5.7",
      front: R`Define <em>conditional independence</em> of \(A\) and \(B\) given \(E\). Does it imply (or follow from) ordinary independence?`,
      back: R`$$P(A \cap B \mid E) = P(A \mid E)\,P(B \mid E)$$ <b>Neither implies the other.</b> Independence ⇏ conditional independence given \(E\); conditional independence given \(E\) ⇏ independence, and ⇏ conditional independence given \(E^c\).`,
    },
  ];

  /* ---------------- practice problem generators ---------------- */

  const generators = [
    {
      id: "c2-gen-table", name: "Conditional probability from a table",
      blurb: "Two-way count tables, like the superstitious-fan example.",
      make() {
        const a = U.randInt(8, 16), b = U.randInt(5, 14), c = U.randInt(5, 14), d = U.randInt(10, 24);
        // a = win & present, b = win & absent, c = loss & present, d = loss & absent
        const which = U.pick(["wf", "wnf", "w"]);
        const total = a + b + c + d;
        const ans = which === "wf" ? a / (a + c) : which === "wnf" ? b / (b + d) : (a + b) / total;
        const askTex = which === "wf" ? R`P(W \mid F)` : which === "wnf" ? R`P(W \mid F^c)` : R`P(W)`;
        const askTxt = which === "wf" ? "the team won, given your friend was at the game"
          : which === "wnf" ? "the team won, given your friend was NOT at the game"
          : "the team won (unconditionally)";
        return {
          q: R`A friend claims his presence helps his favorite team. Season records:<br><br>
              <table class="tbl"><tr><th></th><th>Friend present</th><th>Friend absent</th></tr>
              <tr><td><b>Win</b></td><td>${a}</td><td>${b}</td></tr>
              <tr><td><b>Loss</b></td><td>${c}</td><td>${d}</td></tr></table><br>
              A game is selected at random from these ${total}. Let \(W\) = win, \(F\) = friend present. Find \(${askTex}\), the probability that ${askTxt}.`,
          answer: ans, kind: "prob",
          sol: R`<div class="sol-step">Condition by restricting to the relevant column (or the whole table for \(P(W)\)):</div>
               <div class="sol-step">$$P(W \mid F) = \frac{${a}}{${a + c}}, \qquad P(W \mid F^c) = \frac{${b}}{${b + d}}, \qquad P(W) = \frac{${a + b}}{${total}}$$</div>
               <div class="sol-step">Answer: \(${U.fmt(ans)}\).</div>`,
        };
      },
    },
    {
      id: "c2-gen-conddef", name: "Using the definition P(A|B) = P(A∩B)/P(B)",
      blurb: "Given event probabilities, compute conditionals.",
      make() {
        const pa = U.randInt(15, 35) / 100, pb = U.randInt(30, 50) / 100;
        const pab = U.randInt(6, Math.round(Math.min(pa, pb) * 100) - 2) / 100;
        const flip = Math.random() < 0.5;
        const ans = flip ? pab / pb : pab / pa;
        const ask = flip ? R`P(A \mid B)` : R`P(B \mid A)`;
        return {
          q: R`For events \(A\) and \(B\): \(P(A) = ${pa}\), \(P(B) = ${pb}\), and \(P(A \cap B) = ${pab}\). Find \(${ask}\).`,
          answer: ans, kind: "prob",
          sol: R`<div class="sol-step">By the definition of conditional probability, $$${ask} = \frac{P(A \cap B)}{${flip ? `P(B)` : `P(A)`}} = \frac{${pab}}{${flip ? pb : pa}} \approx ${U.fmt(ans)}.$$</div>`,
        };
      },
    },
    {
      id: "c2-gen-lotp", name: "Law of total probability",
      blurb: "Weighted average over a partition (two or three groups).",
      make() {
        const three = Math.random() < 0.4;
        if (!three) {
          const pM = U.pick([0.5, 0.4, 0.6, 2 / 3]);
          const p1 = U.randInt(2, 8) / 100, p2 = U.randInt(1, 5) / 1000;
          const ans = p1 * pM + p2 * (1 - pM);
          return {
            q: R`In a population, a fraction ${U.fmt(pM, 3)} are men and the rest are women. ${U.fmt(p1 * 100)}% of men and ${U.fmt(p2 * 100, 2)}% of women are colorblind. A person is selected at random. What is the probability that they are colorblind?`,
            answer: ans, kind: "prob",
            sol: R`<div class="sol-step">Let \(M\) = male, \(C\) = colorblind. \(\{M, M^c\}\) partitions the population, so use LOTP:</div>
                 <div class="sol-step">$$P(C) = P(C \mid M)P(M) + P(C \mid M^c)P(M^c) = ${p1} \times ${U.fmt(pM, 3)} + ${p2} \times ${U.fmt(1 - pM, 3)} \approx ${U.fmt(ans, 5)}$$</div>`,
          };
        }
        const w = [U.randInt(2, 5), U.randInt(2, 5), U.randInt(2, 5)];
        const s = w[0] + w[1] + w[2];
        const d = [U.randInt(1, 6) / 100, U.randInt(1, 6) / 100, U.randInt(1, 6) / 100];
        const ans = (w[0] / s) * d[0] + (w[1] / s) * d[1] + (w[2] / s) * d[2];
        return {
          q: R`A factory has three machines. Machine 1 produces ${w[0]} of every ${s} items, Machine 2 produces ${w[1]}, and Machine 3 produces ${w[2]}. Their defect rates are ${U.fmt(d[0] * 100)}%, ${U.fmt(d[1] * 100)}%, and ${U.fmt(d[2] * 100)}% respectively. An item is picked at random from total production. What is the probability it is defective?`,
          answer: ans, kind: "prob",
          sol: R`<div class="sol-step">The machines partition production with \(P(M_i) = ${w[0]}/${s},\ ${w[1]}/${s},\ ${w[2]}/${s}\).</div>
               <div class="sol-step">$$P(D) = \sum_{i=1}^{3} P(D \mid M_i)P(M_i) = ${d[0]}\cdot\tfrac{${w[0]}}{${s}} + ${d[1]}\cdot\tfrac{${w[1]}}{${s}} + ${d[2]}\cdot\tfrac{${w[2]}}{${s}} \approx ${U.fmt(ans, 5)}$$</div>`,
        };
      },
    },
    {
      id: "c2-gen-bayes", name: "Bayes' rule",
      blurb: "Flip the conditioning: tests, coins, and machines.",
      make() {
        const variant = U.pick(["test", "coin"]);
        if (variant === "test") {
          const prev = U.pick([0.01, 0.02, 0.05, 0.1]);
          const sens = U.pick([0.9, 0.95, 0.99]);
          const fpr = U.pick([0.05, 0.1, 0.02]);
          const pPos = sens * prev + fpr * (1 - prev);
          const ans = (sens * prev) / pPos;
          return {
            q: R`A disease affects ${U.fmt(prev * 100)}% of a population. A test detects the disease with probability ${sens} when it is present (sensitivity), but also gives a false positive with probability ${fpr} when it is absent. A randomly selected person tests positive. What is the probability they actually have the disease?`,
            answer: ans, kind: "prob",
            sol: R`<div class="sol-step">Let \(D\) = has disease, \(+\) = positive test. We want \(P(D \mid +)\); we are given \(P(+ \mid D) = ${sens}\), \(P(+ \mid D^c) = ${fpr}\), \(P(D) = ${prev}\).</div>
                 <div class="sol-step">LOTP for the denominator: $$P(+) = ${sens} \times ${prev} + ${fpr} \times ${U.fmt(1 - prev)} = ${U.fmt(pPos, 5)}$$</div>
                 <div class="sol-step">Bayes' rule: $$P(D \mid +) = \frac{P(+ \mid D)P(D)}{P(+)} = \frac{${sens} \times ${prev}}{${U.fmt(pPos, 5)}} \approx ${U.fmt(ans)}$$</div>
                 <div class="sol-step">Note how a positive test on a rare disease can still leave the probability surprisingly low — the prior matters.</div>`,
          };
        }
        const pH = U.pick([0.75, 0.8, 0.7]);
        const n = U.randInt(2, 4);
        const pDataFair = Math.pow(0.5, n);
        const pDataBias = Math.pow(pH, n);
        const ans = (pDataFair * 0.5) / (pDataFair * 0.5 + pDataBias * 0.5);
        return {
          q: R`You have one fair coin and one biased coin that lands Heads with probability ${pH}. You pick one of the two at random and flip it ${n} times; it lands Heads all ${n} times. Given this, what is the probability you picked the <b>fair</b> coin?`,
          answer: ans, kind: "prob",
          sol: R`<div class="sol-step">Let \(F\) = picked fair coin, \(A\) = all ${n} flips Heads. Prior: \(P(F) = P(F^c) = 1/2\).</div>
               <div class="sol-step">Likelihoods: \(P(A \mid F) = (1/2)^{${n}} = ${U.fmt(pDataFair, 5)}\), \(P(A \mid F^c) = ${pH}^{${n}} = ${U.fmt(pDataBias, 5)}\).</div>
               <div class="sol-step">$$P(F \mid A) = \frac{P(A \mid F)P(F)}{P(A \mid F)P(F) + P(A \mid F^c)P(F^c)} = \frac{${U.fmt(pDataFair, 5)}}{${U.fmt(pDataFair, 5)} + ${U.fmt(pDataBias, 5)}} \approx ${U.fmt(ans)}$$</div>`,
        };
      },
    },
    {
      id: "c2-gen-indep", name: "Independence & reliability",
      blurb: "Independent components: all work, or at least one fails.",
      make() {
        const p1 = U.randInt(80, 98) / 100, p2 = U.randInt(80, 98) / 100, p3 = U.randInt(80, 98) / 100;
        const all = p1 * p2 * p3;
        const which = Math.random() < 0.5 ? "all" : "one";
        const ans = which === "all" ? all : 1 - all;
        return {
          q: R`A device needs three independent components to function. The components work correctly with probabilities ${p1}, ${p2}, and ${p3}. What is the probability that ${which === "all" ? "<b>all three</b> components work" : "<b>at least one</b> component fails"}?`,
          answer: ans, kind: "prob",
          sol: R`<div class="sol-step">By independence, $$P(\text{all work}) = ${p1} \times ${p2} \times ${p3} = ${U.fmt(all, 5)}.$$</div>
               <div class="sol-step">"At least one fails" is the complement: $$1 - ${U.fmt(all, 5)} = ${U.fmt(1 - all, 5)}.$$</div>
               <div class="sol-step">Answer: \(${U.fmt(ans, 5)}\).</div>`,
        };
      },
    },
    {
      id: "c2-gen-union-indep", name: "Independent events: at least one",
      blurb: "P(A ∪ B) for independent events, loyalty-program style.",
      make() {
        const pa = U.randInt(30, 70) / 100, pb = U.randInt(20, 60) / 100;
        const which = Math.random() < 0.5 ? "both" : "union";
        const both = pa * pb;
        const union = pa + pb - both;
        const ans = which === "both" ? both : union;
        const [ia, ib] = U.pick([["orders a coffee", "orders a donut"], ["buys a ticket", "buys popcorn"], ["subscribes to the app", "enables notifications"]]);
        return {
          q: R`On a given day, a customer ${ia} with probability ${pa} and ${ib} with probability ${pb}, independently. What is the probability the customer ${which === "both" ? "does <b>both</b>" : "does <b>at least one</b> of the two"}?`,
          answer: ans, kind: "prob",
          sol: R`<div class="sol-step">Independence gives \(P(A \cap B) = ${pa} \times ${pb} = ${U.fmt(both, 4)}\).</div>
               <div class="sol-step">Addition rule: \(P(A \cup B) = ${pa} + ${pb} - ${U.fmt(both, 4)} = ${U.fmt(union, 4)}\).</div>
               <div class="sol-step">Answer: \(${U.fmt(ans, 4)}\).</div>`,
        };
      },
    },
    {
      id: "c2-gen-odds", name: "Odds ↔ probability",
      blurb: "Convert between odds and probability.",
      make() {
        const num = U.randInt(1, 5), den = U.randInt(1, 5);
        if (Math.random() < 0.5) {
          const ans = num / (num + den);
          return {
            q: R`The odds of an event \(A\) are ${num} to ${den} in favor, i.e. \(\text{odds}(A) = ${num}/${den}\). What is \(P(A)\)?`,
            answer: ans, kind: "prob",
            sol: R`<div class="sol-step">\(\text{odds}(A) = \frac{P(A)}{1 - P(A)} = \frac{${num}}{${den}}\) ⟹ \(${den}\,P(A) = ${num}(1 - P(A))\).</div>
                 <div class="sol-step">$$P(A) = \frac{${num}}{${num} + ${den}} \approx ${U.fmt(ans)}$$</div>`,
          };
        }
        const p = U.randInt(2, 8) / 10;
        const ans = p / (1 - p);
        return {
          q: R`If \(P(A) = ${p}\), what are the odds of \(A\)? (Enter as a decimal or fraction.)`,
          answer: ans, kind: "prob", tol: 0.01,
          sol: R`<div class="sol-step">$$\text{odds}(A) = \frac{P(A)}{P(A^c)} = \frac{${p}}{${U.fmt(1 - p)}} \approx ${U.fmt(ans)}$$</div>`,
        };
      },
    },
  ];

  MATH340.registerUnit({
    id: "ch2",
    title: "Chapter 2 · Conditional Probability",
    short: "Ch 2 · Conditional",
    week: 2,
    order: 2,
    description: "Conditional probability, Bayes' rule, odds, the law of total probability, independence, and conditional independence.",
    flashcards,
    generators,
  });
})();
