# Data review: `programs.js` vs. the official Tyndale program sheets

Checked on 2026-10-03. All 34 PDFs linked from `programs.js` were downloaded into
`reference/pdfs/` (gitignored), plus one extra sheet discovered during the review
(2026–27 Media Arts – Production). Text was extracted two ways:

- `pdftotext -layout` → `reference/pdfs/txt/` (plain reading copy)
- a bold/italic-aware extraction → `reference/pdfs/struct/` (the one that actually
  mattered — see "How the sheets are laid out" below)

**Nothing in `programs.js` was changed.** This is a findings list for you to review.

---

## Summary

| | Count |
|---|---|
| Entries reviewed | **59** (39 programs, 16 minors, 4 concentrations) |
| Entries with at least one discrepancy | **43** |
| Entries completely clean | **16** |

The clean ones, so you can skip them entirely:

- **Programs (2):** `bba`, `bba-h`
- **Minors (13):** `m-bst`, `m-bus`, `m-child`, `m-apol`, `m-engl`, `m-ethlaw`,
  `m-hgs`, `m-ics`, `m-ling`, `m-past`, `m-phil`, `m-psyc`, `m-youth`
- **Concentrations (1):** `ling-bt`

### The four special-focus areas

> **1. Media Arts (all four variants) — confirmed badly grouped.**
> The *course codes* are almost all correct, but the block structure is wrong in every
> one of the eight Media Arts entries. `programs.js` lumps rows into `{pool:[...]}`
> groups that don't exist on the sheets. The real sheets are a precise alternation of
> "One of" choices and individually required courses — e.g. for Media Arts – Business
> the first four rows are *"One of MEDA 111 / MEDA 113"*, then **MEDA 121 required**,
> then **MEDA 210 required**, not one undifferentiated pool of four. On top of that,
> **none of the Media Arts pools carry a `cr:` value**, so those 36-credit major blocks
> can't be scored at all. Separately, the single shared `MEDA_ELECT` list is wrong for
> all four variants: each variant's PDF has its own elective list, and `MEDA_ELECT`
> wrongly includes courses that are *major requirements* for that variant.
> Full detail per entry below.

> **2. Core blocks whose rows don't add up — 31 of them, all from one root cause.**
> This is the single biggest problem in the file, and it is one bad constant.
> `HUM1 = {pick:1, of:["HIST 101","HIST 102","INDS 101","INDS 475","PHIL 171"]}` treats
> five courses as alternatives. On every sheet, the "One of" group is **only HIST 101 /
> HIST 102**, and **INDS 101, INDS 475 and PHIL 171 are each separately required**.
> That's 9 missing credit hours in every core block built from `coreStd` / `HUM1`.
> `HGS_CORE` and `bre-ym` have the same mistake in a different shape, and `bre-gm` /
> `bre-pm` have their own separate core errors. In total **44 blocks across the file have
> row sums that don't match their own stated credit total**, plus **9 more that can't be
> summed at all** because their pools have no credit value. Every one is listed below.
> Good news: `BBA_CORE` and `PHIL_CORE` already model the core correctly — use them as
> the template for the fix.

> **3. Media Arts – Production: a 2026–27 sheet now EXISTS.**
> `programs.js` cites the 2025–26 sheet with a note saying no 2026–27 version was posted.
> A 2026–27 sheet is now live:
> `https://www.tyndale.ca/sites/default/files/programs/2026-09/Tyndale-University-Program-Requirements-Media-Arts-Production-2026-2027.pdf`
> (downloaded to `reference/pdfs/`). Worth knowing: **the program page at
> tyndale.ca/programs/media-arts-production still links the old 2025–26 PDF** — the new
> file is on the server but the page wasn't updated, which is probably why the original
> extraction missed it. The 2026–27 sheet is **materially different**: the 6-credit
> Language elective requirement is **gone** (core drops 39 → 33), electives rise
> 36 → 42 (BA) and 24 → 30 (Honours), and several placeholder `MEDA 3XX` codes are now
> real numbers (Social Media Production = **MEDA 312**, Media Sound = **MEDA 322**,
> Corporate Storytelling = **MEDA 380**). `programs.js` is a faithful copy of the
> 2025–26 sheet — it's just now a year out of date.

> **4. Concentrations — 3 of the 4 have real problems.**
> `ling-bt` (Bible Translation) is perfect. `engl-wc` has PHIL 201 wrongly folded into a
> choice group when it's required, plus an invented filler row. `phil-apol` asks for
> 6 elective credits where the sheet says 9. `phil-law` and `phil-apol` disagree with
> each other about whether "total" means listed coursework or net-new credits — one of
> the two is wrong either way. Detail below.

### How the sheets are laid out (useful for the fix)

Every sheet says *"(Credit hours in bold are required)"*. In the PDF the credit-hours
column is **bold** for a required course and *italic* for an option inside a
"One of" / "Two of" group. Plain `pdftotext` throws that formatting away, which is
almost certainly how the original extraction went wrong — with the bold/italic gone,
INDS 101 / INDS 475 / PHIL 171 just *look* like more entries in the "One of" list
printed above them. If you re-extract anything, use the bold-aware output in
`reference/pdfs/struct/`, where required rows are marked `[REQ]` and options `[opt]`.

One Tyndale typo spotted, not a `programs.js` problem: on the Media Arts – Fine Arts
sheet, the BA major block's total line reads "Total **Degree** Requirements 36" where it
should read "Total **Major** Requirements 36".

---

## The core-requirements bug, stated once

Because this accounts for 31 of the 43 flagged entries, here it is in full once rather
than repeated in every section.

**What `programs.js` has** (via `coreStd` / `HUM1`):

```
BSTH 101, BSTH 102, BSTH 201, BSTH 270        12
two of ENGL 101 / 102 / 171                    6
one of HIST 101 / HIST 102 / INDS 101 /
       INDS 475 / PHIL 171                     3     <-- wrong
(+ whatever FA / NS / SS the program adds)
```

**What every sheet actually says:**

```
BSTH 101, BSTH 102, BSTH 201, BSTH 270        12
two of ENGL 101 / 102 / 171                    6
one of HIST 101 / HIST 102                     3
INDS 101   University Studies in Christian Perspective   3   (required)
INDS 475   Christianity and Culture                      3   (required)
PHIL 171   Introduction to Philosophy                    3   (required)
(+ whatever FA / NS / SS the program adds)
```

So each affected core block is **short by exactly 9 credit hours**, and the stated block
total in `programs.js` (27, 33, 36, 39 …) is in fact *correct* — it matches the PDF. It's
the rows that are missing courses. Two exceptions worth noting:

- **Philosophy** (`PHIL_CORE`) is already right, and its core correctly *omits* PHIL 171
  because PHIL 171 sits in the Philosophy major instead.
- **English** and **History and Global Studies** cores correctly omit the ENGL / HIST
  picks respectively, because those courses live in their own majors.

Entries affected by this exact bug (core block rows = stated total − 9):

`bst`, `bst-h`, `bst-mdiv`, `bst-pent`, `bus`, `cmpt`, `engl`, `engl-h`, `ece`, `ssw`,
`ling`, `ling-h`, `ma-bus`, `ma-bus-h`, `ma-fa`, `ma-fa-h`, `ma-min`, `ma-min-h`,
`ma-prod`, `ma-prod-h`, `musc`, `musc-perf`, `musc-wa`, `psyc`, `psyc-h`, `psyc-dcp`
— 26 entries.

`hgs` and `hgs-h` have the same root cause in a different shape (see their section), and
`bre-gm`, `bre-pm`, `bre-ym` have their own distinct core problems (see theirs).

---

# PROGRAMS

## `bst` — Biblical Studies and Theology (BA)
`Tyndale-University-Program-Requirements-Biblical-Studies-and-Theology-2026-2027.pdf`

- **Core requirements**: the standard core bug above — programs.js rows add to 18, the
  stated total of 27 is correct, INDS 101 / INDS 475 / PHIL 171 are missing as required rows.

Everything else checks out: major 48 matches row-for-row (including the Greek-or-Hebrew
6-credit pool), electives 45, total 120, GPA 2.0, and both notes match the sheet.

## `bst-h` — Biblical Studies and Theology (BA Honours)
same PDF

- **Core requirements**: standard core bug (rows 18, stated 27).

Major 66 matches exactly (including the 12-credit Greek and/or Hebrew pool, BSTH 497,
BSTH 499), electives 27, total 120, GPA 3.0.

## `bst-mdiv` — Biblical Studies and Theology + MDiv (BA / MDiv)
same PDF

- **Core requirements**: standard core bug (rows 18, stated 27).

All five blocks otherwise match (major 48, minor 24, electives 6, advanced standing 15,
total 120), and both notes match the sheet.

## `bst-pent` — Biblical Studies and Theology – Pentecostal (BA)
`Tyndale-University-Program-Requirements-Biblical-Studies-and-Theology-PAONL-2026-2027.pdf`

- **Core requirements**: standard core bug — rows add to 15, stated total 24 is correct.
- **Major requirements** (minor wording): programs.js says `{el:"BSTH course (not BSTH 450)", cr:3}`
  — the PDF row is `BSTH 4___`, i.e. specifically a **4000-level** BSTH course. Worth
  tightening, since it affects the upper-level credit count.

The 45-credit Pentecostal program block is a perfect match, including CHRI 308 = 9 credits,
the "Five of" BSTH list and the "Two of" BUSI/CHRI/PSYC list. Electives 15, total 120.

## `bus` — Business (BA)
`Tyndale-University-Program-Requirements-Business-2026-2027.pdf`

- **Core requirements**: standard core bug (rows 24, stated 33).
- **Major requirements**: programs.js lists **MATH 322** in the "three of" group —
  the PDF says **MATH 323** (Data Analysis). Heads-up: the Psychology sheet calls the same
  course title *Data Analysis* **MATH 322**, so Tyndale's own two sheets disagree. Worth
  asking the Registrar which code is live for 2026–27 rather than guessing.

Otherwise major 42 matches, electives 45, total 120.

## `cmpt` — Christian Ministry and Practical Theology (BA)
`Tyndale-University-Program-Requirements-BA-Christian-Ministry-and-Practical-Theology-2026-2027.pdf`

- **Core requirements**: standard core bug (rows 30, stated 39).

Major 48 matches row-for-row, including the internship pick (CHRI 329/339/349/369), the
Greek-or-Hebrew 6, and the 15-credit "Five of" BSTH/CHRI/PHIL 294/PSYC 211-212 group.
Electives 33, total 120.

## `engl` — English (BA)
`Tyndale-University-Program-Requirements-English-2026-2027.pdf`

- **Core requirements**: standard core bug (rows 24, stated 33).
- **Major requirements**: programs.js says `{pick:1, of:["ENGL 375","ENGL 378"]}` —
  **the PDF requires both.** ENGL 375 (Shakespeare) and ENGL 378 (Milton) each have a bold
  3 in the credit column, so they're two separate required courses, not a choice. This is
  exactly the missing 3 credits: programs.js rows add to 33 against a stated 36.

The rest matches: the American-literature "One of" list (5 options) and the period
"One of" list (10 options) are both exactly right. Electives 51, total 120.

## `engl-h` — English (BA Honours)
same PDF

- **Core requirements**: standard core bug (rows 24, stated 33).
- **Major requirements**: same ENGL 375 / ENGL 378 problem as above — both are required,
  not a pick-1. programs.js rows add to 42 against a stated 45.

Otherwise correct, including ENGL 400, the pick-3 period group (9 credits), and the
6-credit "ENGL 497 + 499 thesis **or** two ENGL 4000-level courses" choice. Electives 42.

## `hgs` — History and Global Studies (BA)
`Tyndale-University-Program-Requirements-History-and-Global-Studies-2026-2027.pdf`

- **Core requirements**: `HGS_CORE` uses
  `{pick:2, of:["ENGL 101","ENGL 102","ENGL 171","INDS 101","INDS 475","PHIL 171"]}` —
  the PDF's "Two of" group is **ENGL 101 / 102 / 171 only** (6 credits), and INDS 101,
  INDS 475 and PHIL 171 are three separately required courses (9 credits). Rows add to 27
  against a stated 36. Same root cause as the core bug, different shape.

The 36-credit major is **perfect** — all three "One of" lists (Christian 4 options,
American 12, European 14) match the sheet exactly. Electives 48, total 120.

## `hgs-h` — History and Global Studies (BA Honours)
same PDF

- **Core requirements**: same `HGS_CORE` problem as above (rows 27, stated 36).
- **Major requirements**: **two required courses are missing.** The PDF requires
  **HIST 441** (Colossus: Britain in the Age of Queen Victoria) and **HIST 481** (The Great
  Depression) as separate bold rows in the Honours major, on top of the three "One of"
  groups. programs.js rows add to 42 against a stated 48 — these two courses are the
  missing 6 credits.
- **Major requirements** (related detail): in the Honours major the option lists are
  slightly *shorter* than in the BA, precisely because those two courses moved out —
  the American list drops HIST 481 (11 options) and the European list drops HIST 441
  (13 options). programs.js reuses the BA's `HGS_AMER` / `HGS_EUR`, so Honours students
  would be offered HIST 441/481 as choices *and* be required to take them.

Electives 36, total 120, GPA 3.0 all correct.

## `ece` — Human Services – Early Childhood Education (BA + Diploma)
`Tyndale-University-Program-Requirements-Early-Childhood-Education-2026-2027.pdf`

- **Core requirements**: standard core bug (rows 24, stated 33).
- **Major requirements** (minor): programs.js has `{el:"PSYC courses", cr:6}`. The PDF is
  more specific: one **PSYC 3000-level** course and one **PSYC 4000-level** course. Same
  6 credits, but the distinction matters for the upper-level count.

The 30-credit Interdisciplinary Studies block matches exactly (all 10 courses). Major
total 39, electives 18, total 120. Correctly has no upper-level note — the sheet doesn't
have one either.

## `ssw` — Human Services – Social Service Work (BA + Diploma)
`Tyndale-University-Program-Requirements-Social-Service-Work-2026-2027.pdf`

- **Core requirements**: standard core bug (rows 24, stated 33).

Everything else is clean: Interdisciplinary Studies 30 (all 10 courses), major 39
(SOCI 251, SOCI 252, SOCI 321 + 30 transfer), electives 18, total 120, and correctly no
upper-level note.

## `ling` — Linguistics (BA)
`Tyndale-University-Program-Requirements-Linguistics-2026-2027.pdf`

- **Core requirements**: standard core bug (rows 27, stated 36).

Major 36 is an exact match (LING 101/102/201/203/204/211 + 12 at 3000-level + 6 at
4000-level). Electives 48, total 120.

## `ling-h` — Linguistics (BA Honours)
same PDF

- **Core requirements**: standard core bug (rows 27, stated 36).

Major 48 exact (same six courses + 18 at 3000-level + 6 at 4000-level + LING 497 + LING 499).
Electives 36, total 120, GPA 3.0.

---

## The Media Arts major blocks

All eight Media Arts entries share the same two structural problems, so here they are once.

**Problem A — the pools aren't real, and they have no credit values.**
`programs.js` models each major as a handful of `{pool:[...], label}` rows with no `cr:`.
Two consequences: (1) the 36-credit major block can't be scored, because a pool with no
credit value contributes nothing; (2) the groupings merge choices with required courses,
so the tracker can't tell a student what they actually have to take.

Every Media Arts sheet is built from just two row types — a **"One of"** pair/short list,
and an **individually required course**. For example, `MEDA_PROD1` is
`["MEDA 111","MEDA 113","MEDA 121","MEDA 210"]` presented as one pool "Production
foundations"; the sheet actually says:

```
One of          3        <- choose one
  MEDA 111  Introduction to Cinematography      (option)
  MEDA 113  Introduction to Filmmaking          (option)
MEDA 121  Language of Media               3     <- required
MEDA 210  The Art of Editing             3     <- required
```

Same story for `MEDA_PHIL` (`["MEDA 230","PHIL 241","MEDA 212"]`): it's *one of
MEDA 230 / PHIL 241*, plus **MEDA 212 required**.

**Problem B — `MEDA_ELECT` is one shared list, but each variant has its own.**
Each sheet's "Major Elective Requirements" list excludes that variant's own major
requirements. The shared 24-item `MEDA_ELECT` therefore offers students courses they're
already required to take. Per variant, `MEDA_ELECT` wrongly includes:

| Entry | Wrongly offered as electives (they're major requirements) |
|---|---|
| `ma-bus` / `ma-bus-h` | BUSI 231, MEDA 280, MEDA 380, MEDA 3XX-SMB, MEDA 4XX-APM, MEDA 3XX-RSS, PSYC 360 |
| `ma-fa` / `ma-fa-h` | ARTM 310, MEDA 322, MEDA 320, MEDA 380, MEDA 3XX-DOC, MEDA 4XX-EXP |
| `ma-min` / `ma-min-h` | MEDA 340, MEDA 3XX-HMJ, MEDA 3XX-MEF, MEDA 4XX-FCW, MEDA 4XX-MCT |
| `ma-prod` / `ma-prod-h` | ARTM 310, MEDA 322, MEDA 214, MEDA 312, MEDA 380, MEDA 3XX-DOC, MEDA 410, MEDA 3XX-MEF |

`MEDA_ELECT` is also **missing ARTM 340**, which is a listed elective option on the
2026–27 Production sheet.

A further wrinkle: in several elective lists two courses are bracketed as a nested
"One of" (e.g. *one of* ARTM 310 / MEDA 322 counts as a single elective choice), so the
lists aren't flat.

**Problem C — the Honours block rows add to 9, not 12.**
`MA_HONS` is stated as 12 credits (which is right) but its three rows sum to 9. The sheets
say:

```
MEDA 4XX  Internship                        6     <- six credits, not three
Either                                      6
  MEDA 4XX  Senior Thesis                   6
  OR  ARTM 312 (3) AND ARTM 350 (3)
```

So: the internship is a **6-credit** course (it needs a `CREDIT_OVERRIDES` entry), and the
capstone is a single 6-credit either/or — not the two stacked `pick:1` rows currently used.
Also note the sheets fold these 12 credits into one 48-credit "Total Major Requirements"
rather than a separate Honours block; 36 + 12 = 48, so the arithmetic still works if you
keep them split.

## `ma-bus` — Media Arts – Business (BA)
`Tyndale-University-Program-Requirements-Media-Arts-Business-2026-2027.pdf`

- **Core requirements**: standard core bug (rows 24, stated 33).
- **Major requirements**: Problem A. Stated 36 is correct but can't be computed. The real
  12 rows: *one of MEDA 111/113*; **MEDA 121**; **MEDA 210**; *one of MEDA 230/PHIL 241*;
  **MEDA 212**; *one of BUSI 231/MEDA 280*; *one of ARTM 340/MEDA 232*; *one of
  HIST 387/MEDA 3XX-SWC*; **MEDA 3XX-SMB**; **MEDA 380**; *one of MEDA 3XX-RSS/PSYC 360*;
  **MEDA 4XX-APM**. In particular the "Cinema history and media business" pool merges a
  2-way choice with two required courses, and "Research and project management" merges a
  2-way choice with one required course.
- **Major electives**: Problem B (see table).

Electives 42 and total 120 are correct.

## `ma-bus-h` — Media Arts – Business (BA Honours)
same PDF

- **Core requirements**: standard core bug (rows 24, stated 33).
- **Major requirements**: Problem A, identical rows to `ma-bus`.
- **Honours requirements**: Problem C (rows 9, stated 12).
- **Major electives**: Problem B.
- **Note on sourcing**: this PDF is missing the pages that would confirm the Honours
  Business totals — it jumps from academic-calendar page 142 straight to 150, so the
  Honours major total, elective total and degree total aren't in the file. The structure
  is identical on the Fine Arts, Media Ministry and Production sheets (major 48,
  major electives 9, electives 30, total 120), and `programs.js`'s numbers match that
  pattern, so they're very probably right — but they are **not directly verified** for
  this variant. Worth a glance at the printed Academic Calendar pages 143–149.

## `ma-fa` — Media Arts – Fine Arts (BA)
`Tyndale-University-Program-Requirements-Media-Arts-Fine-Arts-2026-2027.pdf`

- **Core requirements**: standard core bug (rows 24, stated 33).
- **Major requirements**: Problem A. The real 12 rows: *one of MEDA 111/113*;
  **MEDA 121**; **MEDA 210**; *one of MEDA 230/PHIL 241*; **MEDA 212**; *one of
  ARTM 340/MEDA 232*; **MEDA 320**; *one of HIST 387/MEDA 3XX-SWC*; *one of
  ARTM 310/MEDA 322*; **MEDA 380**; **MEDA 3XX-DOC**; **MEDA 4XX-EXP**.
  The "Faith, film and animation" pool merges a 2-way choice with required MEDA 320;
  "Sound, story and experimental media" merges a 2-way choice with three required courses.
- **Major electives**: Problem B (see table).

Electives 42 and total 120 correct.

## `ma-fa-h` — Media Arts – Fine Arts (BA Honours)
same PDF

- **Core requirements**: standard core bug (rows 24, stated 33).
- **Major requirements**: Problem A, same rows as `ma-fa`.
- **Honours requirements**: Problem C (rows 9, stated 12).
- **Major electives**: Problem B.

Electives 30, total 120, GPA 3.0 correct. This is the one sheet that spells the Honours
structure out in full, so it's the best reference for fixing `MA_HONS`.

## `ma-min` — Media Arts – Media Ministry (BA)
`Tyndale-University-Program-Requirements-Media-Arts-Media-Ministry-2026-2027.pdf`

- **Core requirements**: standard core bug (rows 24, stated 33).
- **Major requirements**: Problem A. The real 12 rows: *one of MEDA 111/113*;
  **MEDA 121**; **MEDA 210**; *one of MEDA 230/PHIL 241*; **MEDA 212**; *one of
  ARTM 340/MEDA 232*; **MEDA 340**; *one of HIST 387/MEDA 3XX-SWC*; **MEDA 3XX-HMJ**;
  **MEDA 3XX-MEF**; **MEDA 4XX-FCW**; **MEDA 4XX-MCT**.
  The "Theology of media" pool is the worst case in the file — it merges a 2-way choice
  with **four** separately required courses.
- **Major electives**: Problem B (see table).

Electives 42, total 120 correct.

## `ma-min-h` — Media Arts – Media Ministry (BA Honours)
same PDF

- **Core requirements**: standard core bug (rows 24, stated 33).
- **Major requirements**: Problem A, same rows as `ma-min`.
- **Honours requirements**: Problem C (rows 9, stated 12).
- **Major electives**: Problem B.

Electives 30, total 120, GPA 3.0 correct.

## `ma-prod` — Media Arts – Production (BA)
currently cites `...Media-Arts-Production-2025-2026.pdf`; the 2026–27 sheet now exists

**First: against the 2025–26 sheet it currently cites, the block totals are all correct**
(core 39, major 39, major electives 6, electives 36, total 120). The problems are that a
newer sheet exists and that the major rows are mis-grouped.

- **Whole entry — out of date**: switch `pdf:` to
  `PDF+"2026-09/Tyndale-University-Program-Requirements-Media-Arts-Production-2026-2027.pdf"`,
  drop `sheetYear:"2025–26"`, and drop the note about no 2026–27 sheet being posted.
- **Core requirements**: the 2026–27 sheet **removes the 6-credit Language elective**.
  programs.js says 39 with `LANG` — the new sheet says **33** with no language requirement.
  (And on top of that, the core still has the standard `HUM1` bug: rows 30 vs stated 39.)
- **Electives**: programs.js says 36 — the 2026–27 sheet says **42**.
- **Major requirements**: stated 39 is still right, but Problem A applies and two named
  courses are hidden inside a generic slot. The 2026–27 rows are: *one of MEDA 111/113*;
  **MEDA 121**; **MEDA 210**; **MEDA 212**; **MEDA 214**; *one of MEDA 230/PHIL 241*;
  *one of ARTM 340/MEDA 232*; **MEDA 312**; *one of HIST 387/MEDA 3XX-SWC*; *one of
  ARTM 310/MEDA 322*; **MEDA 380**; **MEDA 3XX-DOC**; **MEDA 410**.
  programs.js is missing **MEDA 312** entirely and replaces MEDA 380 / MEDA 3XX-DOC with a
  generic `{el:"MEDA 3000-level courses", cr:6}`.
- **Major electives**: Problem B (see table), including the missing ARTM 340.
- **Placeholder codes resolved**: on the 2025–26 sheet several rows were `MEDA 3XX`; the
  2026–27 sheet gives real numbers — Social Media Production = **MEDA 312**,
  Media Sound = **MEDA 322**, Corporate Storytelling = **MEDA 380**. Worth updating the
  `MEDA 3XX-*` placeholders in `catalog.json` too, if they're there.

New block totals for 2026–27: core 33, major 39, major electives 6, electives 42 = 120.

## `ma-prod-h` — Media Arts – Production (BA Honours)
same situation

- **Whole entry — out of date**: same PDF swap as `ma-prod`.
- **Core requirements**: 39 → **33** (Language elective removed), plus the standard
  `HUM1` bug (rows 30).
- **Electives**: programs.js says 24 — the 2026–27 sheet says **30**.
- **Major requirements**: Problem A, same rows as `ma-prod`, missing MEDA 312.
- **Honours requirements**: Problem C (rows 9, stated 12).
- **Major electives**: Problem B.

New block totals for 2026–27: core 33, major 39 + honours 12 (= the sheet's 51),
major electives 6, electives 30 = 120.

---

## `musc` — Music (BA)
`Tyndale-University-Program-Requirements-Music-BA-2026-2027.pdf`

- **Core requirements**: standard core bug (rows 27, stated 36).
- **Major requirements** (minor): programs.js has one `{el:"Music and Worship Arts courses", cr:12}`.
  The PDF splits this into a 3-credit MWA elective at any level plus **9 credits at the
  3000 level**. Same total, but it matters for the upper-level count.
- **Credit override labels** (minor): `CREDIT_OVERRIDES` uses ranges ending in 8
  (`MUSC 1V1-4V8`, `MUSC 1B1-4B8`, …), but the BA Music sheet's ranges end in 6
  (`MUSC 1V1-4V6`, `MUSC 1B1-4B6`, `MUSC 1S1-4S4`, …). The BFA sheets do use the `-8`
  ranges, so the BA ones look wrong.

Major total 48 is correct and the structure is otherwise right, including MUSC 390 = 1
credit and the 2-credit MUSC 490/491 choice. The note about vocal vs instrumental
ensembles matches the sheet. Electives 36, total 120.

## `musc-perf` — Music: Performance (BFA Honours)
`Tyndale-University-Program-Requirements-Music-Performance-BFA-2026-2027.pdf`

- **Core requirements**: standard core bug (rows 27, stated 36).
- **Major requirements**: programs.js has `{el:"Music Ensemble", cr:8}` — the PDF requires
  **16 credits of ensemble**, in two 8-credit halves (for voice: 8 from Tyndale Singers
  plus 8 from Singers/Band/Community Choir; for every other instrument: 16 from
  Band/Jazz Combo). This is the main error.
- **Major requirements**: the `{el:"Instrument literature and pedagogy …", cr:8}` row is
  overstated for most streams. It's 8 credits only for **piano** (MUSC 141 + 441 + 442);
  for voice it's 5 (MUSC 312 + 411) and for guitar 5 (MUSC 121 + 421), with a separate
  3-credit MWA elective making up the difference. As written, lit/pedagogy 8 + MWA 3 = 11
  where the sheet has 8 total.

Net effect of those two: rows add to 69 against a stated 74. The stated 74 is correct.
Electives 12, total 122, and the "45 of 122" note are all right.

## `musc-wa` — Music: Worship Arts (BFA Honours)
`Tyndale-University-Music-Worship-Arts-BFA-Program-Requirements-2026-2027.pdf`

- **Core requirements**: standard core bug (rows 27, stated 36).
- **Major requirements**: same ensemble error — `{el:"Music Ensemble", cr:8}` should be
  **16**. Rows add to 66 against a stated 74, and this accounts for the whole 8-credit gap.

Everything else in the 74-credit major matches exactly (ARTM 310, CHRI 346, CHRI 347,
MUSC 101/201/202/304/332/335/369/371/390/404/432/491, the 2-credit MUSC 4X1 pedagogy slot,
and 16 credits of applied music). Electives 12, total 122.

## `phil` — Philosophy (BA)
`Tyndale-University-Program-Requirements-Philosophy-2026-2027.pdf`

- **Major requirements**: **PHIL 421 is not a required course.** `PHIL_MAJ` lists
  `{pick:1, of:["PHIL 363","PHIL 366"]}` and then `"PHIL 421"` as required. The PDF has a
  single "One of" group with **three** options — PHIL 363, PHIL 366 and PHIL 421 — all
  three italic in the credit column. Should be `{pick:1, of:["PHIL 363","PHIL 366","PHIL 421"]}`
  with no separate PHIL 421 row. programs.js rows add to 39 against a stated 36; this is
  the extra 3 credits.

The core block is **correct** (`PHIL_CORE` models INDS 101 / INDS 475 properly and
rightly omits PHIL 171, which is in the major). Electives 48, total 120.

## `phil-h` — Philosophy (BA Honours)
same PDF

- **Major requirements**: same PHIL 421 problem as above. Rows add to 51 against a
  stated 48.
- **Major requirements**: the honours capstone is a **choice**, not fixed. programs.js
  hardcodes `"PHIL 497","PHIL 499"`; the PDF says *"One of: PHIL 497 & 499 Honours Thesis
  (6) **or** PHIL 4___ Philosophy courses (6)"*. Same 6 credits, but students can take two
  4000-level courses instead of the thesis.

Core is correct. Electives 36, total 120, GPA 3.0, and the "apply in winter of second
year" note all match.

## `psyc` — Psychology (BA)
`Tyndale-University-Program-Requirements-Psychology-with-DCP-2026-2027.pdf`

- **Core requirements**: standard core bug (rows 24, stated 33).

The 48-credit major is an exact match — all 12 `PSYC_CORE` courses plus 6 at the 3000
level and 6 at the 4000 level. (Note this sheet calls Data Analysis **MATH 322**, which is
what programs.js has; the Business sheet calls it MATH 323.) Electives 39, total 120.

## `psyc-h` — Psychology (BA Honours)
same PDF

- **Core requirements**: standard core bug (rows 24, stated 33).

Major 54 exact (12 core courses + 6 at 3000 level + PSYC 401 + PSYC 461 + PSYC 497 +
PSYC 499). Electives 33, total 120. The note about finishing PSYC 360 and 461 by third
year and arranging a supervisor by February 28 matches the sheet.

## `psyc-dcp` — Psychology Degree Completion (BA)
same PDF

- **Core requirements**: standard core bug (rows 24, stated 33).

Major 51 exact (12 core courses + PSYC 392 + 6 at 3000 level + PSYC 401 + one 4000-level).
Electives 36, total 120. The "25+ with 30–42 transferable credit hours" note matches.

## `bre-gm` — General Ministries (BRE)
`Tyndale-University-Program-Requirements-General-Ministries-2026-2027.pdf`

This core block has **three separate errors** which partly cancel out — rows add to 66
against a stated 63, so the net gap hides the real problems.

- **Core requirements**: **CHRI 203 (Spiritual Formation, 3 credits) is missing.** The PDF
  requires it in core.
- **Core requirements**: there's a **duplicate row**. programs.js has both
  `{pick:1, of:["CHRI 341","CHRI 361"]}` *and* `{el:"Evangelism or Global Christianity", cr:3}`
  — but CHRI 341 **is** Evangelism and CHRI 361 **is** Global Christianity. The second row
  double-counts the first. Delete it.
- **Core requirements**: programs.js requires **ENGL 101 and ENGL 102 and ENGL 171**
  (9 credits). The PDF says **"Two of"** ENGL 101 / 102 / 171 (6 credits).
- **Core requirements** (minor): programs.js has one 12-credit
  `{el:"Biblical Studies and Theology courses"}`. The PDF splits it into 6 credits at the
  **3000 level** plus 6 credits at any level — relevant to the 24-of-90 upper-level rule.

The 15-credit General Ministries focus block is a perfect match (CHRI 121, CHRI 344,
6 credits of CHRI, and the internship pick). Electives 12, total 90, and the
"24 of 90 at the 3000/4000 level" note are all correct.

## `bre-dcp` — BRE Degree Completion (BRE)
same PDF

All credit totals and courses match — major 60, transfer 30, total 90. Two minor
labelling points only:

- **Major requirements** (minor): the 12-credit `{el:"Biblical Studies and Theology courses"}`
  is split on the PDF into 6 at the **2000 level** and 6 at the **3000 level**.
- **Major requirements** (minor): `{el:"Christian Ministries courses", cr:9}` is
  `CHRI 2___` on the PDF, i.e. specifically **2000-level**.

Both matter only for the upper-level credit count. Otherwise this entry is sound,
including CHRI 394, CHRI 395, the internship pick, and all three "One of" pairs.

## `bre-pm` — Pastoral Ministry (BRE)
`Tyndale-University-Program-Requirements-Pastoral-Ministry-2026-2027.pdf`

Its core is identical on the PDF to General Ministries and Youth Ministry, and it has a
similar cluster of errors — rows add to 60 against a stated 63.

- **Core requirements**: the BSTH elective allowance is **9** in programs.js — the PDF
  gives **12** (6 at the 3000 level plus 6 at any level).
- **Core requirements**: same **duplicate row** as `bre-gm` — both
  `{pick:1, of:["CHRI 341","CHRI 361"]}` and `{el:"Global Christianity", cr:3}` are
  present, and CHRI 361 *is* Global Christianity. Delete the second.
- **Core requirements**: programs.js has `{pick:1, of:["ENGL 101","ENGL 102","ENGL 171"]}`
  (3 credits) — the PDF says **"Two of"** (6 credits).

The 15-credit Pastoral Ministry focus block matches exactly (CHRI 121, CHRI 343, CHRI 344,
CHRI 349, and the CHRI 341/346/347 pick). Electives 12, total 90, upper-level note correct.

## `bre-ym` — Youth Ministry (BRE)
`Tyndale-University-Program-Requirements-Youth-Ministry-2026-2027.pdf`

- **Core requirements**: programs.js collapses seven courses into
  `{pick:2, of:["ENGL 101","ENGL 102","ENGL 171","HIST 251","HIST 252","INDS 101","PHIL 171"]}`.
  The PDF's "Two of" group is **ENGL 101 / 102 / 171 only** (6 credits), and **HIST 251,
  HIST 252, INDS 101 and PHIL 171 are each separately required** (12 credits). Rows add to
  51 against a stated 63 — this is the whole 12-credit gap. (This core is otherwise
  identical to `bre-gm` / `bre-pm`, including CHRI 203, so all three can share one
  constant once fixed.)
- **Youth Ministry focus**: programs.js has
  `{pick:1, of:["CHRI 331","CHRI 332","CHRI 338","CHRI 343"]}` — the PDF says **"Two of"**
  (6 credits). Rows add to 12 against a stated 15.

Electives 12, total 90, upper-level note correct.

## `biol` — Biology (Honours), BSc 2+2 with Redeemer
`Tyndale-University-Program-Requirements-Biology-2026-2027.pdf`

This sheet has no credit-hours column — it's a plain two-year course list totalling 60
credits — so there's less to check, but the last row is misleading.

- **Science courses**: `{el:"Flora & Fauna of Southwestern Ontario / other", cr:15}` reads
  as though Flora & Fauna is a 15-credit course. On the sheet it's **one 3-credit course**
  (listed as `BIOL XXX`). The sheet's named courses come to 48 credits (15 core + 33
  non-core), leaving **12 credits unaccounted for** — these are free/Humanities-Social
  Science electives needed to reach 60. Better modelled as `BIOL XXX` (3 credits) plus a
  separate 12-credit elective row.

The 15-credit `SCI_CORE` block is an exact match, as is the rest of the science list
(MATH 121, SOCI 101, BIOL 103, BIOL 104, BIOL 221, BIOL 231, CHEM 101, CHEM 102, MATH 111,
and the MATH 112/PHYS 101 pick). Total 60 and the "C- minimum per course" GPA note
are right.

## `hs-premed` — Health Sciences Pre-Medicine, Chemistry Minor (BSc 2+2)
`Tyndale-University-Program-Requirements-Pre-Med-Chemistry-Minor-2026-2027.pdf`

- **Science courses**: `{el:"Foundations of Human Anatomy I & II", cr:9}` — that's **two
  courses, so 6 credits**, not 9. The sheet's named courses come to 57 credits
  (15 core + 42 non-core), leaving **3 credits** of elective to reach 60. The extra 3 is
  currently hidden inside the anatomy row.

`SCI_CORE` 15 matches exactly, and all 12 named non-core courses match (HEAL 301,
PSYC 101, MATH 121, SOCI 101, BIOL 103, BIOL 104, BIOL 231, CHEM 101, CHEM 102, MATH 111,
MATH 112, PHYS 101). Total 60 correct.

## `hs-prof` — Health Sciences Professional, Psychology Minor (BSc 2+2)
`Tyndale-University-Program-Requirements-Health-Science-Professional-Psychology-Minor-2026-2027.pdf`

- **Science courses**: `{el:"Foundations of Human Anatomy I & II", cr:12}` — again that's
  **two courses, 6 credits**, not 12. Named courses come to 54 credits (15 core +
  39 non-core), leaving **6 credits** of elective to reach 60, currently hidden inside the
  anatomy row.

`SCI_CORE` 15 matches, and all 11 named non-core courses match (HEAL 301, PSYC 101,
PSYC 102, MATH 121, SOCI 101, BIOL 103, BIOL 104, BIOL 231, CHEM 101, CHEM 102, PHYS 101).
Total 60 correct.

---

# MINORS

13 of the 16 minors are completely clean: `m-bst`, `m-bus`, `m-child`, `m-apol`, `m-engl`,
`m-ethlaw`, `m-hgs`, `m-ics`, `m-ling`, `m-past`, `m-phil`, `m-psyc`, `m-youth`. Two of
those have a small labelling note worth knowing about, listed at the end.

## `m-meda` — Media Arts (24 credits)
`Tyndale-University-Program-Requirements-Media-Arts-Business-2026-2027.pdf`
(the same minor block appears on all four Media Arts sheets, identically)

- **Minor rows**: Problem A from the Media Arts section. The two pools have no credit
  value, so only 9 of the 24 credits can be computed. The sheet's actual rows are:
  *one of MEDA 111 / MEDA 113* (3); **MEDA 121** (3); **MEDA 210** (3); *one of MEDA 230 /
  PHIL 241* (3); **MEDA 212** (3); **MEDA 3___ Media Arts courses** (9) = 24.

The 24 total and the 9-credit 3000-level slot are correct.

## `m-mwa` — Music and Worship Arts (24 credits)
`Tyndale-University-Program-Requirements-Music-Worship-Arts-Minor-2026-2027.pdf`

- **Minor rows**: rows add to **23** against a stated 24 — off by one credit. The cause is
  the ensemble pick: `{pick:1, of:["MUSC 1B1-4B8","MUSC 1C1-4C8","MUSC 1J1-4J8","MUSC 1S1-4S8"]}`
  resolves to 1 credit via `CREDIT_OVERRIDES`, but the sheet lists these ensemble entries
  at **2 credits** each. The sheet also uses the single codes **MUSC 1B1 / 1C1 / 1J1 /
  1S1**, not the `-4x8` ranges.

Everything else matches: CHRI 346, CHRI 347, MUSC 101, MUSC 202, MUSC 369 (2 credits), the
2-credit applied-music row, and the 6-credit "Two of" group (MUSC / MUSC / ARTM 310 /
ARTM 312 / CHRI 340).

## `m-soci` — Sociology (24 credits)
`Tyndale-University-Program-Requirements-Sociology-2026-2027.pdf`

- **Minor rows** (minor): programs.js has one `{el:"SOCI 2000/3000-level courses", cr:18}`.
  The PDF splits this into **6 credits at the 2000 level** and **12 credits at the 3000
  level**. Total 24 is correct; the split matters for upper-level tracking.

### Small labelling notes on otherwise-clean minors

- **`m-past`** (Pastoral Ministry): `{el:"CHRI 3000-level, PSYC 211 or PSYC 212", cr:6}` is
  slightly too strict — the PDF's "Two of" group allows **any** CHRI course, not just
  3000-level, alongside PSYC 211 / PSYC 212. Credits and all four named courses are right.
- **`m-apol`** (Christian Apologetics): `{el:"Approved apologetics electives", cr:9}` is
  correct at 9 credits, but the PDF spells out an explicit **18-option** list (ARTM 340,
  BSTH 280/308/320/346/383/387, ENGL 308/374, HIST 251/252/312/313/387, three different
  PHIL 481 seminars, and PSYC 305). Worth listing them out if you want the tracker to
  offer real choices. (The sheet prints PSYC 305 as "PYSC 305" — a Tyndale typo.)

---

# CONCENTRATIONS

`ling-bt` is clean. The other three all need attention.

## `engl-wc` — Writing and Communication (15 credits)
`Tyndale-University-Program-Requirements-Writing-Communication-2026-2027.pdf`

- **Concentration rows**: **PHIL 201 is a required course, not one of a choice.**
  programs.js has `{pick:1, of:["ENGL 262","ENGL 263","PHIL 201"]}`. On the sheet,
  ENGL 262 and ENGL 263 are the two italic options of a "One of" group, and **PHIL 201
  (Critical Reasoning) has a bold 3** — it's required on its own.
- **Concentration rows**: the row `{el:"Additional concentration course (see sheet)", cr:3}`
  **does not exist on the sheet.** It looks like filler added to reach 15. The real
  structure is: *one of ENGL 262 / ENGL 263* (3) + **PHIL 201** (3) + *three of* the
  11-course list (9) = 15.
- **Note** (worth adding): the sheet marks the ENGL 262/263 choice
  *"cannot count toward Major requirements"*. This matters because the English major has
  its own ENGL 262/263 pick — without this note a student could double-count one course.

The 15 total, the 11-option "Three of" list, and the "at least one at the 3000/4000 level"
note are all correct.

## `phil-apol` — Christian Apologetics (12 credits)
`Tyndale-University-Program-Requirements-Christian-Apologetics-2026-2027.pdf` (page 2)

- **Concentration rows**: `{el:"Approved apologetics electives", cr:6}` — the sheet
  requires **"Three of"**, i.e. **9 credits**, from its list.
- **Concentration total**: the listed coursework is PHIL 261 (3) + PHIL 294 (3) +
  three courses (9) = **15 credits**, while the sheet's note says *"12 hours on top of BA
  Philosophy Major requirements."* Both numbers are real but mean different things: 15 is
  the coursework, 12 is the net-new credits after overlap with the Philosophy major (two
  of the options are explicitly flagged *"cannot count toward Major requirements"*, which
  is what that overlap is about). programs.js stores 12 and then shrinks the elective row
  to 6 to make it add up — which loses a required course. Better to store the 15 credits
  of coursework and record "12 net new" separately.
- **Concentration rows** (minor): the concentration's option list is **16** items, not the
  minor's 18 — it omits the PHIL 481 Hume seminar and PSYC 305. Worth listing explicitly
  rather than using a generic elective label.

## `phil-law` — Law (15 credits)
`Tyndale-University-Program-Requirements-Philosophy-Law-2026-2027.pdf`

The rows here are **exactly right** — BUSI 321, PHIL 243, PHIL 311, PHIL 328 and the
*one of PHIL 213 / PHIL 215 / PHIL 313* pick, 15 credits of coursework.

- **Concentration total**: programs.js says 15; the sheet's note says *"12 hours on top of
  BA Philosophy Major requirements."* Same 15-vs-12 distinction as `phil-apol` above — but
  note the file handles the two **inconsistently**: `phil-law` uses the coursework figure
  (15) and `phil-apol` uses the net-new figure (12). Whichever convention you pick, one of
  these two entries has to change so the tracker doesn't count the two concentrations on
  different bases.

---

## Suggested order to fix things

1. **Fix `HUM1` / `coreStd`** (one constant, clears 26 entries), then `HGS_CORE`, then the
   shared BRE core. Copy the shape of `BBA_CORE` / `PHIL_CORE`, which are already correct.
   This alone resolves 31 of the 44 broken blocks.
2. **Repoint Media Arts – Production** at the 2026–27 PDF and update core 39→33 and
   electives 36→42 / 24→30.
3. **Rebuild the Media Arts majors** as explicit "one of" + required rows with real credit
   values, and give each of the four variants its own elective list. Fix `MA_HONS`
   (internship = 6 credits, capstone = one 6-credit either/or).
4. **The small content errors**: ENGL 375 + 378 both required; PHIL 421 into the pick-1
   group; HIST 441 + HIST 481 added to Honours History; Music Ensemble 8→16 in both BFAs;
   `bre-gm` missing CHRI 203 + duplicate row; `bre-pm` duplicate row; `bre-ym` focus
   pick-1→pick-2; `m-mwa` ensemble credit; anatomy rows in the two Health Sciences entries.
5. **Decide the concentration convention** (coursework credits vs net-new credits) and
   apply it to `phil-apol` and `phil-law` consistently; fix `engl-wc`'s PHIL 201 and drop
   its phantom row.
6. **Ask the Registrar about MATH 322 vs MATH 323** — Tyndale's own Business and
   Psychology sheets disagree on the code for Data Analysis.
