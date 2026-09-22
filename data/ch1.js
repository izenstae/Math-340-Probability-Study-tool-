/* ============================================================
 * Chapter 1 — Probability and Counting  (Weeks 1)
 * Source: class lecture notes (C1) + Blitzstein & Hwang ch. 1
 * ============================================================ */
(function () {
  const U = MATH340.util;
  const R = String.raw;

  const flashcards = [
    {
      id: "c1-sample-space", tag: "Definition 1.2.1",
      front: R`What is the <em>sample space</em> \(S\) and an <em>event</em> \(A\)?`,
      back: R`The sample space \(S\) is the set of <b>all possible outcomes</b> of an experiment. An event \(A\) is any <b>subset</b> of \(S\); we say \(A\) occurred if the actual outcome is in \(A\).`,
    },
    {
      id: "c1-event-ops", tag: "Set operations",
      front: R`When do \(A \cup B\), \(A \cap B\), and \(A^c\) occur?`,
      back: R`\(A \cup B\): at least one of \(A\), \(B\) occurs.<br>\(A \cap B\): both \(A\) and \(B\) occur.<br>\(A^c\): \(A\) does <b>not</b> occur.`,
    },
    {
      id: "c1-disjoint", tag: "Definition",
      front: R`When are two events \(A\) and \(B\) <em>mutually exclusive (disjoint)</em>?`,
      back: R`When they cannot occur at the same time: $$A \cap B = \emptyset.$$`,
    },
    {
      id: "c1-naive", tag: "Definition 1.3.1",
      front: R`State the <em>naive definition</em> of probability, and its two restrictions.`,
      back: R`$$P_{\text{naive}}(A) = \frac{|A|}{|S|} = \frac{\#\text{ favorable outcomes}}{\#\text{ total outcomes}}$$ Requires \(S\) to be <b>finite</b> and all outcomes <b>equally likely</b>.`,
    },
    {
      id: "c1-mult-rule", tag: "Theorem 1.4.1",
      front: R`State the <em>multiplication rule</em> for a compound experiment.`,
      back: R`If experiment A has \(a\) possible outcomes and, for each of them, experiment B has \(b\) possible outcomes, the compound experiment has $$a \times b$$ outcomes. (A need not happen before B.)`,
    },
    {
      id: "c1-samp-repl", tag: "Theorem 1.4.7",
      front: R`How many outcomes are there when choosing \(k\) times from \(n\) objects <em>with replacement</em>?`,
      back: R`$$n^k$$ Each of the \(k\) draws has all \(n\) options available.`,
    },
    {
      id: "c1-samp-norepl", tag: "Theorem 1.4.8",
      front: R`How many outcomes are there when choosing \(k\) times from \(n\) objects <em>without replacement</em> (order matters)?`,
      back: R`$$n(n-1)(n-2)\cdots(n-k+1) = \frac{n!}{(n-k)!}, \qquad 1 \le k \le n.$$`,
    },
    {
      id: "c1-permutation", tag: "Formula",
      front: R`Give the formula for the number of <em>permutations</em> of \(k\) objects chosen from \(n\) (ordered selection).`,
      back: R`$$P_{n,k} = n(n-1)\cdots(n-k+1) = \frac{n!}{(n-k)!}$$ In R: <code>factorial(n)/factorial(n-k)</code>.`,
    },
    {
      id: "c1-combination", tag: "Formula",
      front: R`Give the formula for the number of <em>combinations</em> of \(k\) objects chosen from \(n\) (unordered selection).`,
      back: R`$$\binom{n}{k} = \frac{n!}{k!\,(n-k)!}$$ In R: <code>choose(n, k)</code>.`,
    },
    {
      id: "c1-order", tag: "Concept",
      front: R`How do you decide between a permutation and a combination?`,
      back: R`Ask whether <b>order matters</b>. Distinct roles/positions/sequences (president vs. treasurer, 1st–2nd–3rd place) → permutation. Groups where members are interchangeable (committees, teams, hands of cards) → combination.`,
    },
    {
      id: "c1-overcount", tag: "Example 1.4.13",
      front: R`Splitting 4 people into two unlabeled teams of 2: why isn't the answer \(\binom{4}{2} = 6\)?`,
      back: R`Choosing team \(\{A,B\}\) is the same split as choosing team \(\{C,D\}\) — each split is counted twice. <b>Adjust for overcounting</b>: divide by 2, giving \(6/2 = 3\).`,
    },
    {
      id: "c1-axioms", tag: "Definition 1.6.1",
      front: R`State the general definition (axioms) of a probability function \(P\).`,
      back: R`A probability space is a sample space \(S\) plus a function \(P\) assigning each event \(A \subseteq S\) a number in \([0,1]\), with:<br>1. \(P(\emptyset) = 0\), &nbsp; 2. \(P(S) = 1\),<br>3. If \(A_1, A_2, \dots\) are disjoint, $$P\Big(\bigcup_{j=1}^{\infty} A_j\Big) = \sum_{j=1}^{\infty} P(A_j).$$`,
    },
    {
      id: "c1-complement", tag: "Theorem 1.6.2 (1)",
      front: R`State the <em>complement rule</em>.`,
      back: R`$$P(A^c) = 1 - P(A)$$ Often the fastest route for "at least one …" questions: compute the probability of <em>none</em> and subtract from 1.`,
    },
    {
      id: "c1-monotone", tag: "Theorem 1.6.2 (2)",
      front: R`What does <em>monotonicity</em> of probability say?`,
      back: R`If \(A \subseteq B\), then $$P(A) \le P(B).$$`,
    },
    {
      id: "c1-addition", tag: "Theorem 1.6.2 (3)",
      front: R`State the <em>addition rule</em> (inclusion–exclusion for two events).`,
      back: R`$$P(A \cup B) = P(A) + P(B) - P(A \cap B)$$ Subtracting \(P(A \cap B)\) corrects for double-counting the overlap.`,
    },
    {
      id: "c1-ie3", tag: "Inclusion–Exclusion",
      front: R`State inclusion–exclusion for <em>three</em> events \(A, B, C\).`,
      back: R`$$\begin{aligned}P(A \cup B \cup C) ={}& P(A) + P(B) + P(C)\\ &- P(A \cap B) - P(A \cap C) - P(B \cap C)\\ &+ P(A \cap B \cap C)\end{aligned}$$`,
    },
    {
      id: "c1-ie-gen", tag: "Theorem 1.6.3",
      front: R`State the general <em>inclusion–exclusion</em> formula for \(A_1, \dots, A_n\).`,
      back: R`$$P\Big(\bigcup_{i=1}^n A_i\Big) = \sum_i P(A_i) - \sum_{i<j} P(A_i \cap A_j) + \sum_{i<j<k} P(A_i \cap A_j \cap A_k) - \cdots + (-1)^{n+1} P(A_1 \cap \cdots \cap A_n)$$ Signs alternate: add singles, subtract pairs, add triples, …`,
    },
    {
      id: "c1-exactly-one", tag: "Useful identity",
      front: R`Express "exactly one of \(A\), \(B\) occurs" and its probability.`,
      back: R`The event is \((A \cap B^c) \cup (A^c \cap B)\), a disjoint union, so $$P(\text{exactly one}) = P(A) + P(B) - 2\,P(A \cap B).$$`,
    },
    {
      id: "c1-neither", tag: "De Morgan + complement",
      front: R`How do you compute \(P(\text{neither } A \text{ nor } B)\)?`,
      back: R`By De Morgan's law, \(A^c \cap B^c = (A \cup B)^c\), so $$P(A^c \cap B^c) = 1 - P(A \cup B) = 1 - P(A) - P(B) + P(A \cap B).$$`,
    },
    {
      id: "c1-r-cmds", tag: "R commands",
      front: R`Which R commands compute \(n!\), \(\binom{n}{k}\), and random samples with / without replacement?`,
      back: R`<code>factorial(n)</code> — \(n!\)<br><code>choose(n, k)</code> — \(\binom{n}{k}\)<br><code>sample(n, k)</code> — \(k\) draws without replacement<br><code>sample(n, k, replace = TRUE)</code> — with replacement<br><code>sample(n, n)</code> — random permutation.`,
    },
  ];

  /* ---------------- practice problem generators ---------------- */

  const generators = [
    {
      id: "c1-gen-perm", name: "Ordered selections (permutations)",
      blurb: "Race podiums, club officers, distinct roles.",
      make() {
        const variant = U.pick(["race", "officers", "graders"]);
        if (variant === "race") {
          const n = U.randInt(7, 12), k = U.randInt(3, 4);
          const ans = U.perm(n, k);
          return {
            q: R`${n} runners compete in a race with no ties, and every runner finishes. How many possibilities are there for the top ${k} finishing positions (in order)?`,
            answer: ans, kind: "count",
            sol: R`<div class="sol-step">Positions are <b>ordered</b>, so use the multiplication rule / permutations: the winner can be any of ${n} runners, second place any of ${n - 1}, and so on.</div>
                 <div class="sol-step">$$P_{${n},${k}} = \frac{${n}!}{(${n}-${k})!} = ${Array.from({ length: k }, (_, i) => n - i).join(" \\times ")} = ${ans}$$</div>`,
          };
        }
        if (variant === "officers") {
          const n = U.randInt(6, 12);
          const ans = U.perm(n, 3);
          return {
            q: R`A club with ${n} members must choose a president, a vice president, and a treasurer (no one may hold two offices). In how many ways can this be done?`,
            answer: ans, kind: "count",
            sol: R`<div class="sol-step">The three offices are <b>distinct roles</b>, so order matters.</div>
                 <div class="sol-step">$$${n} \times ${n - 1} \times ${n - 2} = \frac{${n}!}{(${n}-3)!} = ${ans}$$</div>`,
          };
        }
        const n = U.randInt(8, 12), k = U.randInt(3, 5);
        const ans = U.perm(n, k);
        return {
          q: R`There are ${n} teaching assistants, and ${k} distinct exam questions must each be graded by a <em>different</em> assistant. In how many ways can the grading assignments be made?`,
          answer: ans, kind: "count",
          sol: R`<div class="sol-step">Each question is distinct, so assigning TA X to question 1 differs from assigning them to question 2 — order matters.</div>
               <div class="sol-step">$$P_{${n},${k}} = \frac{${n}!}{(${n}-${k})!} = ${ans}$$</div>`,
        };
      },
    },
    {
      id: "c1-gen-comb", name: "Unordered selections (combinations)",
      blurb: "Committees, project teams, equal roles.",
      make() {
        const n = U.randInt(7, 15), k = U.randInt(2, 4);
        const ans = U.choose(n, k);
        const ctx = U.pick([
          [`A committee of ${k} professors is to be formed from ${n} professors, all with equal roles.`, "committees"],
          [`${k} students are selected from a group of ${n} to work together on a project.`, "teams"],
          [`A pizza shop offers ${n} toppings and you choose exactly ${k} different ones.`, "topping selections"],
        ]);
        return {
          q: R`${ctx[0]} How many different ${ctx[1]} are possible?`,
          answer: ans, kind: "count",
          sol: R`<div class="sol-step">All members/choices are interchangeable — <b>order does not matter</b> — so use combinations.</div>
               <div class="sol-step">$$\binom{${n}}{${k}} = \frac{${n}!}{${k}!\,(${n}-${k})!} = ${ans}$$</div>
               <div class="sol-step">In R: <code>choose(${n}, ${k})</code>.</div>`,
        };
      },
    },
    {
      id: "c1-gen-sampling", name: "Sampling with / without replacement",
      blurb: "Counting strings, PINs, and repeated draws.",
      make() {
        const withRepl = Math.random() < 0.5;
        if (withRepl) {
          const n = U.pick([4, 5, 6, 9, 10]), k = U.randInt(3, 5);
          const ans = Math.pow(n, k);
          return {
            q: R`A code consists of ${k} symbols chosen from an alphabet of ${n} symbols, and symbols <b>may repeat</b>. How many different codes are possible?`,
            answer: ans, kind: "count",
            sol: R`<div class="sol-step">This is sampling <b>with replacement</b>: every one of the ${k} positions has all ${n} symbols available.</div>
                 <div class="sol-step">$$n^k = ${n}^{${k}} = ${ans}$$</div>`,
          };
        }
        const n = U.randInt(6, 10), k = U.randInt(3, 4);
        const ans = U.perm(n, k);
        return {
          q: R`From a jar with ${n} labeled balls, you draw ${k} balls one at a time <b>without replacement</b>, keeping track of the order drawn. How many outcomes are possible?`,
          answer: ans, kind: "count",
          sol: R`<div class="sol-step">Sampling <b>without replacement</b>, order recorded: the count is $$n(n-1)\cdots(n-k+1) = ${Array.from({ length: k }, (_, i) => n - i).join(" \\times ")} = ${ans}.$$</div>`,
        };
      },
    },
    {
      id: "c1-gen-naive", name: "Naive probability with counting",
      blurb: "Equally likely outcomes: dice, committees at random.",
      make() {
        const variant = U.pick(["dice", "committee"]);
        if (variant === "dice") {
          const s = U.randInt(5, 9);
          let count = 0;
          for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (a + b === s) count++;
          const ans = count / 36;
          return {
            q: R`Two fair six-sided dice are rolled. What is the probability that the sum of the two dice equals ${s}? (Enter a decimal or a fraction like 5/36.)`,
            answer: ans, kind: "prob",
            sol: R`<div class="sol-step">The sample space has \(6 \times 6 = 36\) equally likely ordered outcomes.</div>
                 <div class="sol-step">There are ${count} ordered pairs summing to ${s}, so $$P = \frac{${count}}{36} \approx ${U.fmt(ans)}.$$</div>`,
          };
        }
        const g = U.randInt(4, 6), b = U.randInt(4, 6), k = 3, gk = U.randInt(1, 2);
        const total = U.choose(g + b, k);
        const fav = U.choose(g, gk) * U.choose(b, k - gk);
        const ans = fav / total;
        return {
          q: R`A committee of ${k} people is chosen at random from ${g} statisticians and ${b} economists. What is the probability the committee has exactly ${gk} statistician${gk > 1 ? "s" : ""} (and ${k - gk} economist${k - gk > 1 ? "s" : ""})?`,
          answer: ans, kind: "prob",
          sol: R`<div class="sol-step">Total equally likely committees: \(\binom{${g + b}}{${k}} = ${total}\).</div>
               <div class="sol-step">Favorable: choose ${gk} of the ${g} statisticians and ${k - gk} of the ${b} economists: \(\binom{${g}}{${gk}}\binom{${b}}{${k - gk}} = ${fav}\).</div>
               <div class="sol-step">$$P = \frac{\binom{${g}}{${gk}}\binom{${b}}{${k - gk}}}{\binom{${g + b}}{${k}}} = \frac{${fav}}{${total}} \approx ${U.fmt(ans)}$$</div>`,
        };
      },
    },
    {
      id: "c1-gen-ie", name: "Addition rule & inclusion–exclusion",
      blurb: "At least one, exactly one, or neither of two events.",
      make() {
        // generate consistent percentages
        const pa = U.randInt(30, 70) / 100;
        const pb = U.randInt(30, 70) / 100;
        const maxI = Math.min(pa, pb);
        const pab = U.randInt(Math.max(1, Math.round((pa + pb - 1) * 100)), Math.round(maxI * 100) - 5) / 100;
        const [ctxA, ctxB, noun] = U.pick([
          ["get Internet service from the local cable company", "get television service", "households in a suburb"],
          ["read the morning newsletter", "listen to the daily podcast", "subscribers"],
          ["own a laptop", "own a tablet", "students"],
        ]);
        const which = U.pick(["union", "exactly", "neither"]);
        const pUnion = pa + pb - pab;
        const pExactly = pa + pb - 2 * pab;
        const pNeither = 1 - pUnion;
        const ans = which === "union" ? pUnion : which === "exactly" ? pExactly : pNeither;
        const ask = which === "union" ? "at least one of the two" : which === "exactly" ? "exactly one of the two" : "neither of the two";
        return {
          q: R`Among ${noun}: ${Math.round(pa * 100)}% ${ctxA} (event \(A\)), ${Math.round(pb * 100)}% ${ctxB} (event \(B\)), and ${Math.round(pab * 100)}% do both. If one is selected at random, find the probability that they do <b>${ask}</b>.`,
          answer: ans, kind: "prob",
          sol: R`<div class="sol-step">Given: \(P(A) = ${pa}\), \(P(B) = ${pb}\), \(P(A \cap B) = ${pab}\).</div>
               <div class="sol-step">Addition rule: \(P(A \cup B) = ${pa} + ${pb} - ${pab} = ${U.fmt(pUnion)}\).</div>
               <div class="sol-step">Exactly one: \(P(A) + P(B) - 2P(A \cap B) = ${U.fmt(pExactly)}\).</div>
               <div class="sol-step">Neither: \(1 - P(A \cup B) = ${U.fmt(pNeither)}\).</div>
               <div class="sol-step">Answer: $$${U.fmt(ans)}$$</div>`,
        };
      },
    },
    {
      id: "c1-gen-atleast", name: "Complement trick (at least one)",
      blurb: "Compute the complement instead of a messy direct count.",
      make() {
        const variant = U.pick(["six", "match"]);
        if (variant === "six") {
          const n = U.randInt(2, 5);
          const ans = 1 - Math.pow(5 / 6, n);
          return {
            q: R`A fair die is rolled ${n} times. What is the probability of getting <b>at least one</b> 6?`,
            answer: ans, kind: "prob",
            sol: R`<div class="sol-step">Direct counting of "at least one" is messy — use the <b>complement rule</b>.</div>
                 <div class="sol-step">$$P(\text{at least one } 6) = 1 - P(\text{no } 6) = 1 - \left(\frac{5}{6}\right)^{${n}} \approx ${U.fmt(ans)}$$</div>`,
          };
        }
        const n = U.randInt(3, 6), k = U.randInt(2, 3);
        const ans = 1 - Math.pow((n - 1) / n, k);
        return {
          q: R`Each of ${k} people independently and uniformly picks one of ${n} lockers. What is the probability that <b>at least one</b> of them picks locker #1?`,
          answer: ans, kind: "prob",
          sol: R`<div class="sol-step">Complement: nobody picks locker #1. Each person avoids it with probability \(\frac{${n - 1}}{${n}}\), independently.</div>
               <div class="sol-step">$$1 - \left(\frac{${n - 1}}{${n}}\right)^{${k}} \approx ${U.fmt(ans)}$$</div>`,
        };
      },
    },
    {
      id: "c1-gen-vans", name: "Random groups (counting both sides)",
      blurb: "Team-of-players-in-vans style problems.",
      make() {
        const g = U.randInt(4, 6), f = U.randInt(5, 7), c = 3;
        const total = g + f + c;
        const vg = U.randInt(2, 3), vf = U.randInt(3, 4), vc = U.randInt(1, 2);
        const vsize = vg + vf + vc;
        const totalWays = U.choose(total, vsize);
        const fav = U.choose(g, vg) * U.choose(f, vf) * U.choose(c, vc);
        const ans = fav / totalWays;
        return {
          q: R`A basketball team has ${total} players: ${g} guards, ${f} forwards, and ${c} centers. ${vsize} players are chosen at random to ride in the first van. What is the probability the van holds exactly ${vg} guards, ${vf} forwards, and ${vc} center${vc > 1 ? "s" : ""}?`,
          answer: ans, kind: "prob",
          sol: R`<div class="sol-step">All \(\binom{${total}}{${vsize}} = ${totalWays}\) ways to fill the van are equally likely.</div>
               <div class="sol-step">Favorable selections: \(\binom{${g}}{${vg}}\binom{${f}}{${vf}}\binom{${c}}{${vc}} = ${U.choose(g, vg)} \times ${U.choose(f, vf)} \times ${U.choose(c, vc)} = ${fav}\).</div>
               <div class="sol-step">$$P = \frac{${fav}}{${totalWays}} \approx ${U.fmt(ans)}$$</div>`,
        };
      },
    },
  ];

  MATH340.registerUnit({
    id: "ch1",
    title: "Chapter 1 · Probability and Counting",
    short: "Ch 1 · Counting",
    week: 1,
    order: 1,
    description: "Sample spaces, naive probability, the multiplication rule, permutations and combinations, axioms of probability, and inclusion–exclusion.",
    flashcards,
    generators,
  });
})();
