# Probability Studio — MATH 340 Study Companion

An interactive study tool for **MATH 340: Probability** (Fall 2026, Lawrence University), built as a fast, dependency-light static site. It turns each week's lecture material into **spaced-repetition flashcards**, **freshly generated practice problems with worked solutions**, and a **progress dashboard** — so the identities stick and the problem-solving methods become automatic before each Wednesday quiz, the midterm, and the final.

> **Textbook:** Blitzstein & Hwang, *Introduction to Probability* (2nd ed.) · **Course schedule, key dates, and grade weights are built in** from the syllabus.

![Dashboard](docs/assets/dashboard.png)

## Features

**🃏 Flashcards with spaced repetition**
Every definition, theorem, and identity from lecture is a card (Definition 2.2.1, Bayes' rule, inclusion–exclusion, Table C distributions, …). A Leitner system schedules reviews: cards you know move up a box and appear less often; cards you miss come back the next day. Cards in box 4+ count as *mastered*. Keyboard-friendly (Space to flip, 1/2 to grade).

**✏️ Generated practice problems**
Each topic is a *family of problems*, not a fixed bank and not one template with the numbers shuffled. The 17 topics — permutations and arrangements, committees, sampling, naive probability, inclusion–exclusion, the complement trick, random splits, the probability axioms, two-way tables, the law of total probability, Bayes' rule, the chain rule, independence and reliability, odds — hold **over 100 structurally different problem types** between them, and a topic cycles through all of its types before any one repeats.

That means a single topic will ask you to count directly, then via the complement, then adjust for overcounting, then reach for stars-and-bars; or run a rule forwards (law of total probability) and then backwards (Bayes), then solve it for a different unknown. Several variants exist purely to punish autopilot — disjoint events that are *not* independent, an event nested inside another, a two-headed coin. You practise **recognising which method applies**, not just executing one. Answers accept decimals, fractions (`5/36`), or percents, and every problem ends with a fully worked, LaTeX-rendered solution.

**📊 Progress tracking**
Per-chapter mastery bars, per-topic accuracy (overall and last 10 attempts), a daily activity heatmap, and a study streak. Progress is stored in your browser and can be exported/imported as JSON to move between devices.

**Σ Reference sheets**
Every identity from lecture on one page, plus the full **Common Distributions table (Table C)** — story, support, PMF/PDF, mean, variance, and MGF for each named distribution. Ideal source material for the one-page midterm formula sheet.

**🗓 Course schedule awareness**
The tool knows the 10-week schedule, highlights the current week, counts down to homework deadlines, the midterm (Oct 21), and the final (Nov 23), and flags quiz weeks.

| Flashcards | Practice |
| --- | --- |
| ![Flashcards](docs/assets/flashcards.png) | ![Practice](docs/assets/practice.png) |

## Using the site

The tool is a static site — no build step, no server, no account.

- **On GitHub Pages (recommended):** enable Pages for this repository (**Settings → Pages → Deploy from a branch → `main` / root**). The site will be live at `https://<username>.github.io/<repository-name>/`.
- **Locally:** clone the repo and open `index.html` in a browser, or serve it with `python3 -m http.server`.

Math rendering (KaTeX) is vendored in `lib/katex/`, so the site also works offline.

## A study routine that fits the course

| When | What |
| --- | --- |
| Daily (5–10 min) | Clear the due flashcards on the Dashboard. |
| After each lecture | Study the new chapter's deck until every card is at box 2+. |
| Tuesday nights | Mixed practice session on last week's chapter — quizzes are Wednesdays and cover the previous week. |
| Before the midterm/final | Use the Reference page to draft the formula sheet; drill the topics flagged "review" in Progress. |

## Course content grows week by week

Lecture materials are released week-of, so the repository adds a content module per chapter as the term progresses:

| Unit | Status |
| --- | --- |
| Chapter 1 · Probability and Counting | ✅ Available |
| Chapter 2 · Conditional Probability | ✅ Available |
| Common Distributions · Table C | ✅ Available (reference + flashcards) |
| Chapters 3–8 (discrete/continuous distributions, expectation, MGFs, multivariate, limit laws) | 🔜 Added as covered in class |

Each unit is a single self-registering file in `data/` — adding a new week requires **no changes to the application code**. See [`docs/ADDING_CONTENT.md`](docs/ADDING_CONTENT.md) for the 10-minute recipe (drop the new lecture PDF on Claude and ask it to follow that guide).

## Project structure

```
├── index.html            # App shell — add one <script> tag per new content unit
├── css/styles.css        # Theme (light/dark), layout, components
├── js/
│   ├── app.js            # Router, dashboard, schedule, reference, progress views
│   ├── flashcards.js     # Leitner spaced-repetition engine + review UI
│   ├── practice.js       # Problem session UI, answer parsing/checking
│   └── store.js          # localStorage persistence, export/import
├── data/
│   ├── manifest.js       # Course info, schedule, key dates, unit registry, math utils
│   ├── ch1.js            # Chapter 1 — flashcards + problem generators
│   ├── ch2.js            # Chapter 2 — flashcards + problem generators
│   └── distributions.js  # Table C reference + distribution flashcards
├── lib/katex/            # Vendored KaTeX (offline math rendering)
├── tools/
│   └── check-generators.js  # Smoke test: every problem variant is well posed (node, no deps)
└── docs/ADDING_CONTENT.md
```

## Privacy

All progress data stays in your browser's `localStorage`. Nothing is transmitted anywhere.

## Acknowledgements

Content is transcribed and adapted from the MATH 340 lecture notes (S. Zhou) and Blitzstein & Hwang, *Introduction to Probability* (2nd ed.), whose Table C the distributions reference follows. This is a personal study aid, not an official course resource.
