# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Tyndale University undergrads — picking a degree program (and optional minor/concentration), then tracking progress against its requirements over the rest of their time at Tyndale: marking courses Planned / In progress / Done, and keeping a class calendar alongside Tyndale's own term and holiday dates. Tyndale students only; not for other schools.

## Product Purpose

A free, unofficial degree requirement tracker. A student picks their program and the matching 2026–27 requirements load automatically; from there the app computes their live progress (credits done/in-progress/planned, upper-level credit count, which requirement blocks are met, how leftover completed courses fill elective slots) instead of leaving that math to them. Success is a student always knowing exactly what they've completed and what's left, without hand-tallying credits or re-reading a PDF.

## Positioning

Two things together, not one: the underlying requirement data is verified line-by-line against Tyndale's real 2026–27 program-sheet PDFs (see `reference/DATA-REVIEW.md`), and every section links back to the official sheet — so a student can trust it's not a guess. On top of that, the app does the live requirement math that a spreadsheet or the PDF alone leaves to the student. A generic planner has the math without the trust; the PDF has the trust without the math.

## Operating Context

- Phone-width (~400px) and desktop web, light and dark mode — both have to hold up.
- A student's whole tracker (program, minor, concentration, course statuses, choices, classes, personal calendar events) is one JSON blob: saved to `localStorage` when signed out, synced to a Supabase row (across devices) when signed in.
- First run forces picking a program before anything else in the app is usable.
- Beta rollout (Milestone 4) hasn't started yet — planned as Calvin plus about 5 classmates.

## Capabilities and Constraints

- Three tabs: **Degree** (requirement blocks/rows for the chosen program + minor + concentration), **Calendar** (Tyndale's own term/holiday/deadline dates plus the student's own classes and events), **Courses** (search/filter/browse the full course catalog, mark status directly).
- Email + password auth via Supabase Auth (sign up/in/out, password reset, email confirmation) — no custom password handling. Account deletion actually removes the auth user and the data row, via a server-side Edge Function (the service key never reaches the browser).
- Collects the minimum: email, optional first name, and the tracker state itself. No student numbers, no grades, no GPA input.
- No monetization, no admin dashboard, no payments, no other backend, no paid services — runs on Supabase's and Vercel's free tiers only.
- Not in scope for v1: lecture recording/transcription, GPA tracking, other schools.
- Requirement/course data is per academic year (`src/data/2026-27/`), generated from `reference/programs.js` + `catalog.json` by `scripts/generate-data.mjs` — a future year is a new dated folder, not an edit to this one.

## Brand Commitments

- Name: "Degree Tracker" (page title "Tyndale Degree Tracker").
- Explicitly unofficial and student-made: the footer states "Unofficial student-made tool. Confirm your plan with the Registrar or your faculty advisor," and the app must never use Tyndale's logo or styling that implies it's an official Tyndale site.
- No monetization, as a standing commitment, not just a v1 omission.

## Evidence on Hand

- `reference/tracker-prototype.html` — a working single-file prototype (built in claude.ai), the current source of truth for visual design: clean, light + dark mode, Spectral / Hanken Grotesk / JetBrains Mono.
- `reference/DATA-REVIEW.md` — the line-by-line verification of requirement data against the official program PDFs.
- Live and deployed at degreetracker.ca (Milestone 3 complete).
- No beta feedback yet — Milestone 4 (beta with Calvin + ~5 classmates) hasn't started. Do not invent testimonials or usage evidence.

## Product Principles

- Accuracy over speed: requirement data is verified against the real official PDFs before anything ships; errors get fixed at the source (`reference/programs.js`) and regenerated, never hand-patched downstream.
- Never pretend to be official: unofficial status is stated plainly, with no Tyndale branding and a standing disclaimer to confirm with the Registrar or faculty advisor.
- Minimal data, minimal cost: collect only what the tracker needs and run on free tiers only.
- Boring and clear over clever: Sebastian is learning, so code and product decisions favor what's easy to understand and explain in plain language.
- Works everywhere a student actually is: phone and desktop, light and dark — neither is the neglected mode.

## Accessibility & Inclusion

No specific requirement established beyond general good practice.
