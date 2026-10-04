# Tyndale Degree Tracker

An unofficial, free website where Tyndale University undergrads pick their degree (and optional minor/concentration), see the 2026–27 requirements, track every course as Planned / In progress / Done, and keep a class calendar. Built by Sebastian, a Tyndale student. Tyndale students only, no monetization.

This file is the project brief. Read it at the start of every session and keep the "Status" section at the bottom up to date.

## Commands

- `npm run dev` — start the Vite dev server
- `npm run build` — typecheck (`tsc -b`) then production build
- `npm run lint` — Oxlint
- `npm test` — run the Vitest suite once (`npx vitest run src/lib/requirements.test.ts -t "name"` for a single test)
- `npm run preview` — serve the production build locally

## Architecture

- **Requirements data** (`src/data/2026-27/`): typed, hand-ported copies of `programs.js`/`catalog.json`. `types.ts` defines the row shapes a requirement block can contain — a bare course code, `{pick, of}`, `{pool, cr}`, `{el, cr}`, or `{free}` — documented at the top of that file. `creditOverrides.ts` holds the handful of non-3-credit courses.
- **Requirements engine** (`src/lib/requirements.ts`): pure functions over `TrackerState`, no React. `sections()` resolves a student's Major/Concentration/Minor into blocks and rows; `effChoice()`/`rowCourses()` decide which marked courses count toward a given row (explicit choices first, then auto-fill up to the row's cap); `compute()` produces the whole-tracker summary (credits done/in-progress/planned, upper-level credits, and how leftover completed courses fill `free` rows). `rowKey()` gives each row a stable id (`section:blockIndex:rowIndex`) used to key `state.choice`. Covered by `requirements.test.ts`.
- **State & persistence**: `TrackerState` (`src/types.ts`) is the one JSON blob that gets persisted — `{v, name, program, minor, conc, status, choice, classes, events, updated}`. `useTrackerState` (`src/hooks/useTrackerState.ts`) owns it: signed-out writes go to `localStorage` only (`src/lib/storage.ts`); signed-in writes debounce (600ms) to the `tracker_state` Supabase table (`src/lib/cloudStorage.ts`) and mirror to `localStorage` as an offline cache. On first sign-in with local data but no cloud row, it sets `importPrompt` so the UI can ask before overwriting.
- **Auth** (`src/hooks/useAuth.ts`): thin wrapper over Supabase Auth (sign up/in/out, password reset, session). Account deletion is a Supabase Edge Function (`supabase/functions/delete-account/`) because deleting the auth user needs the secret key, which never reaches the browser; the function verifies the caller's own token before deleting.
- **UI**: `App.tsx` switches between three tabs (`DegreeTab`, `CalendarTab`, `CoursesTab`), all driven by the same `state`/`setState` pair from `useTrackerState`. `SettingsModal` holds auth + account actions and forces itself open until a program is picked.
- **Database**: single `tracker_state` table, one row per user, RLS-scoped to `auth.uid() = user_id`. Migrations live in `supabase/migrations/`.

## Starting material (in `/reference`)

- `tracker-prototype.html`: a working single-file prototype built in claude.ai. It is the source of truth for features, layout and visual design (clean, light + dark mode, Spectral / Hanken Grotesk / JetBrains Mono). Port it; don't redesign it.
- `programs.js`: requirements for 39 programs, 16 minors, 4 concentrations, plus 2026–27 important dates and term dates. Row types are documented at the top of the file.
- `catalog.json`: 515 courses as `[code, title]`.

`programs.js` was extracted by a summarizing tool, not read directly, so it contains errors. Media Arts is the least reliable. Verifying it is milestone 0.

## Stack

- Vite + React + TypeScript
- Supabase for auth and database (`@supabase/supabase-js`)
- Hosted on Vercel (free Hobby plan), auto-deploys from the GitHub `main` branch
- No other backend. No paid services.

Keep dependencies minimal. Sebastian is learning, so prefer clear, boring code over clever code, and explain what you did in plain language when you finish a step.

## Accounts and login

- Email + password sign-up through Supabase Auth, with email confirmation on. "Sign in with Google" is a later nice-to-have.
- Password reset flow must work.
- Never build custom password handling. Supabase handles it.

## Database

One table is enough to start:

```sql
create table public.tracker_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.tracker_state enable row level security;
-- Policies: a user can select, insert, update and delete only the row where user_id = auth.uid().
```

- `state` holds the same shape the prototype uses: `{v, name, program, minor, conc, status, choice, classes, events, updated}`.
- Debounce saves (about 600 ms) and show a small "Saving… / Saved" indicator like the prototype.
- Keep the SQL in `supabase/migrations/` so it is versioned.
- Test that row level security works: two test accounts must not be able to read each other's data, including via direct API calls with the public key.

## Secrets

- Only the Supabase URL and the **anon/public** key go in the frontend, through `.env.local` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`), which is gitignored.
- Never put the `service_role` key anywhere in this repo or the frontend.
- On Vercel, set the same two variables in Project Settings → Environment Variables.

## Requirements data

- Move requirements into `src/data/2026-27/` as typed JSON or TS: `programs`, `minors`, `concentrations`, `catalog`, `dates`, `terms`.
- Keep the year in the path so next year's data is a new folder, not an edit.
- Every program keeps its link to the official Tyndale PDF; the UI shows "Official sheet ↗" on each section.
- Course credit hours default to 3, with overrides (music lessons, CHRI 308 = 9, etc.) as in `programs.js`.

## Product rules

- Show "Unofficial student-made tool. Confirm your plan with the Registrar or your faculty advisor." in the footer. Never use Tyndale's logo or styling that implies it's an official Tyndale site.
- Collect the minimum: email, optional first name, and the tracker state. No student numbers, no grades, no GPA input.
- A short Privacy page: what is stored, that it's private to the user, and how to delete it.
- Settings must include "Delete my account and data", which actually deletes the row and the auth user. Use a Supabase Edge Function or RPC for the auth deletion, so the service key never reaches the browser.
- Works well on a phone (about 400 px wide) and in dark mode.

## Milestones

Do these in order. Stop at the end of each one, summarize what changed, and wait for Sebastian to try it before moving on.

### 0. Project setup and data verification

1. Scaffold the Vite + React + TS project, init git, and add `.gitignore` (include `.env*.local`).
2. Download each program PDF linked in `programs.js` into `reference/pdfs/` (gitignored), extract the text (e.g. `pdftotext -layout`), and compare it line by line against `programs.js`.
3. Write `reference/DATA-REVIEW.md` listing every discrepancy: program, block, what the file says, what the PDF says. Pay special attention to:
   - Media Arts (all four): the major requirements are grouped approximately in the prototype
   - core requirement blocks whose rows don't add up to the stated credits
   - Media Arts Production: check whether a 2026–27 sheet now exists at tyndale.ca/programs/media-arts-production
   - concentrations
4. Fix the data after Sebastian reviews the list.

### 1. Port the prototype (no login yet)

- Same three tabs: Degree, Calendar, Courses. Same features and look.
- Save to `localStorage` for now.
- Requirement logic (auto-filling picks, free electives, upper-level credit count, block progress) goes in plain functions with a few unit tests (Vitest).

### 2. Accounts and saving

- Sign up, log in, log out, password reset, and email confirmation.
- Save state to `tracker_state`. Offer a one-time import from `localStorage` on first login.
- Delete account. Privacy page.
- Verify row level security with two test accounts.

### 3. Deploy

- Push to GitHub and connect the repo to Vercel.
- Set the environment variables.
- In Supabase Auth settings, add the Vercel URL to Site URL and Redirect URLs, so confirmation and reset emails link to the live site.
- Smoke-test sign-up, saving and deletion on the live URL, on desktop and phone.

### 4. Beta

- Calvin plus about 5 classmates.
- Add a simple "Report a problem with my program's requirements" link, which can just be a mailto shown as copyable text, or a Google Form.

## Not in scope for v1

Lecture recording or transcription, grades or GPA tracking, other schools, payments, an admin dashboard, and anything that needs the Supabase service key in the browser.

## Status

- [x] Milestone 0 — project scaffolded; all program PDFs downloaded and checked against programs.js (see reference/DATA-REVIEW.md); discrepancies fixed and committed.
- [x] Milestone 1 — prototype ported to React/TS: Degree, Calendar and Courses tabs, localStorage save, requirement logic unit-tested (20 tests).
- [x] Milestone 2 — Supabase auth (sign up/in/out, password reset) and cloud save to `tracker_state` with local-import prompt, delete account via Edge Function, Privacy page. Verified with two test accounts: RLS isolation holds, deletion removes the auth user.
- [ ] Milestone 3
- [ ] Milestone 4
