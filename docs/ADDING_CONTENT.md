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
> *"Add this chapter to my study tool following docs/ADDING_CONTENT.md — extract every definition/theorem/identity into flashcards and write 4–7 practice generators for the problem types shown."*

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
    {
      id: "c3-gen-something",              // stable & unique — accuracy stats keyed on this
      name: "Short topic name",
      blurb: "One-line description shown in the topic list.",
      make() {
        const n = U.randInt(5, 12);        // randomize parameters each call
        const ans = /* compute the exact answer */;
        return {
          q: R`Question text with \(\LaTeX\) and the value ${n}.`,
          answer: ans,                     // a single number
          kind: "prob",                    // "prob" (decimal/fraction input) or "count" (integer)
          // tol: 0.01,                    // optional custom tolerance
          sol: R`<div class="sol-step">Step 1 ...</div>
                 <div class="sol-step">$$\text{display math}$$</div>`,
        };
      },
    },
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

## Conventions & gotchas

- **LaTeX in JS strings:** always build LaTeX-bearing strings with ``String.raw`...` `` (aliased to `R` in each file). A plain string literal silently eats backslashes (`"\("` becomes `"("`), which breaks rendering.
- **Delimiters:** `\( ... \)` for inline math, `$$ ... $$` for display math.
- **`<` in math:** card/solution strings are injected as HTML, so a `<` immediately followed by a letter (e.g. `\sum_{i<j}`) is parsed as an HTML tag and truncates the card. Write it as `&lt;` (`\sum_{i&lt;j}`); KaTeX still renders it as `<`. A `<` followed by a space or digit (e.g. `qe^t < 1`) is safe.
- **Stable IDs:** card and generator `id`s are the keys for saved progress. Never rename them once pushed, or users lose that item's history.
- **Answer checking:** `kind: "count"` requires the exact integer; `kind: "prob"` allows a small tolerance (default ±0.0006 or 0.4%, whichever is larger) and accepts `0.25`, `1/4`, or `25%`.
- **Generator hygiene:** make sure every random parameter combination produces a well-posed problem and an `answer` that is a finite number. Quick smoke test in the browser console:

  ```js
  MATH340.units.flatMap(u => u.generators).forEach(g => {
    for (let i = 0; i < 100; i++) {
      const p = g.make();
      console.assert(Number.isFinite(p.answer), g.id, p);
    }
  });
  ```

- **Schedule updates:** dates and topics live in `data/manifest.js` (`schedule`, `keyDates`). Adjust there if the instructor shifts the calendar.
