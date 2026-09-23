# Adding a New Week of Course Content

The app is data-driven: each chapter/unit is one self-registering JavaScript file in `data/`. The dashboard, flashcards, practice, reference, and progress views all pick new units up automatically.

## The two-step recipe

1. **Create `data/chN.js`** following the template below (copy `data/ch2.js` as a starting point).
2. **Add one line to `index.html`**, next to the other data files:

   ```html
   <script src="data/chN.js"></script>
   ```

That's it. Commit and push; GitHub Pages redeploys automatically.

> **Tip:** the fastest workflow is to upload the week's lecture PDF to Claude and say:
> *"Add this chapter to my study tool following docs/ADDING_CONTENT.md — extract every definition/theorem/identity into flashcards, and write 4–7 practice generators with 5–8 structurally different variants each (different methods, not the same formula with new numbers). Then run `node tools/check-generators.js`."*

## Unit template

```js
(function () {
  const U = MATH340.util;      // randInt, pick, shuffle, factorial, perm, choose, fmt
  const R = String.raw;        // IMPORTANT: use R`...` for any string containing LaTeX

  const flashcards = [
    {
      id: "c3-unique-id",                  // stable & unique — progress is keyed on this
      tag: "Definition 3.1.1",             // small label shown on the card
      front: R`What is a <em>random variable</em>?`,
      back: R`A function \(X : S \to \mathbb{R}\) ... $$P(X = x)$$`,
    },
    // ... one card per identity/definition/theorem from lecture
  ];

  const generators = [
    MATH340.makeGenerator({
      id: "c3-gen-something",              // stable & unique — accuracy stats keyed on this
      name: "Short topic name",
      blurb: "One-line description shown in the topic list.",
      variants: [                          // one entry per *distinct* problem shape
        {
          name: "Direct count",                // shown as a pill above the question
          make() {
            const n = U.randInt(5, 12);    // randomize parameters each call
            const ans = /* compute the exact answer */;
            return {
              q: R`Question text with \(\LaTeX\) and the value ${n}.`,
              answer: ans,                 // a single number
              kind: "prob",                // "prob" | "count" | "num" (see below)
              // tol: 0.01,                // optional custom tolerance
              sol: R`<div class="sol-step">Step 1 ...</div>
                     <div class="sol-step">$$\text{display math}$$</div>`,
            };
          },
        },
        {
          name: "Via the complement",      // a different *method*, not just different numbers
          make() { /* ... */ },
        },
      ],
    }),
  ];

  MATH340.registerUnit({
    id: "ch3",                             // unique unit id
    title: "Chapter 3 · Random Variables",
    short: "Ch 3 · RVs",
    week: 3,                               // week the material is covered (from the syllabus)
    order: 3,                              // sort position across units
    description: "One-sentence summary shown on the dashboard.",
    flashcards,
    generators,
    // referenceTable: [...]               // optional — see data/distributions.js
  });
})();
```

## Writing generators that actually vary

A generator is a **family of structurally different problems**, not one template with
the numbers shuffled. `MATH340.makeGenerator` takes a list of `variants` and hands them
out round-robin: a topic cycles through every variant in random order before any of them
repeats, and never repeats one back-to-back across cycles. The variant's `name` is shown
as a pill above the question and counted as "N problem types" in the topic list.

Aim for **5–8 variants** per generator, and make them differ in the *method the student
has to recognise*, not the scenery:

- ✅ direct count vs. complement vs. overcounting adjustment vs. stars-and-bars
- ✅ running a rule forwards (LOTP) and backwards (Bayes), or solving it for a different unknown
- ✅ an edge case that punishes autopilot (disjoint ≠ independent; `A ⊆ B`; a two-headed coin)
- ❌ the same formula wearing a different hat ("8 runners" → "8 swimmers")

Re-skinning a story is still worth doing *inside* a variant (`U.pick` over a few contexts)
so the wording does not become a memorised cue — but it does not count as a variant.

## Conventions & gotchas

- **LaTeX in JS strings:** always build LaTeX-bearing strings with ``String.raw`...` `` (aliased to `R` in each file). A plain string literal silently eats backslashes (`"\("` becomes `"("`), which breaks rendering.
- **Delimiters:** `\( ... \)` for inline math, `$$ ... $$` for display math.
- **`<` in math:** card/solution strings are injected as HTML, so a `<` immediately followed by a letter (e.g. `\sum_{i<j}`) is parsed as an HTML tag and truncates the card. Write it as `&lt;` (`\sum_{i&lt;j}`); KaTeX still renders it as `<`. A `<` followed by a space or digit (e.g. `qe^t < 1`) is safe.
- **Stable IDs:** card and generator `id`s are the keys for saved progress. Never rename them once pushed, or users lose that item's history.
- **Answer checking:** `kind: "count"` requires the exact integer; `kind: "prob"` allows a small tolerance (default ±0.0006 or 0.4%, whichever is larger) and accepts `0.25`, `1/4`, or `25%`. Use `kind: "num"` for a numeric answer that is *not* a probability (odds, an expected count) — same tolerance rules, but the input placeholder stops saying "probability" and the smoke test stops demanding a value in `[0, 1]`.
- **Generator hygiene:** every random parameter combination must produce a well-posed problem and a finite `answer`. Run the smoke test before committing (no dependencies, needs only Node):

  ```sh
  node tools/check-generators.js        # or: node tools/check-generators.js 2000
  ```

  It loads the data files listed in `index.html`, hammers every generator, and fails on a
  non-finite answer, a `count` that is not a whole number, a `prob` outside `[0, 1]`, an
  `undefined`/`NaN` that leaked into the question text, unbalanced `$$` or `\( \)`, a stray
  `<` that the browser would eat as a tag, a duplicate id, or a declared variant that never
  actually appears. It also prints the variant count per generator. CI runs it on every push.

- **Schedule updates:** dates and topics live in `data/manifest.js` (`schedule`, `keyDates`). Adjust there if the instructor shifts the calendar.
