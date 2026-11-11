import { CATALOG } from "../data/2026-27/catalog";
import { CREDIT_OVERRIDES } from "../data/2026-27/creditOverrides";
import { COURSE_DESCRIPTIONS } from "../data/2026-27/courseDescriptions";
import type { ElRow } from "../data/2026-27/types";

export const CAT = new Map(CATALOG);

/** Official description + prerequisite text from tyndale.ca, when the course has one. */
export function details(code: string): { description: string; prereq: string | null } | null {
  return COURSE_DESCRIPTIONS[code] ?? null;
}

/** Credit hours for a course code. Most courses are 3; some are overridden (e.g. CHRI 308 = 9). */
export function cr(code: string): number {
  return CREDIT_OVERRIDES[code] ?? 3;
}

/** Course level (the leading digit of the number), e.g. "ENGL 301" -> 3. 0 if it doesn't parse. */
export function lvl(code: string): number {
  const m = /^[A-Z]{4} (\d)/.exec(code);
  return m ? Number(m[1]) : 0;
}

/** Course title, or a placeholder if it's not in the catalog. */
export function title(code: string): string {
  return CAT.get(code) ?? "Title not in the online catalog";
}

/** Drops a trailing placeholder suffix like "-SWC" for display, e.g. "MEDA 3XX-SWC" -> "MEDA 3XX". */
export function shown(code: string): string {
  return code.replace(/-[A-Z]{3}$/, "");
}

/** How the course appears in the Tyndale timetable, e.g. "ENGL101" + credit hours. Empty for placeholder codes. */
export function regCode(code: string): string {
  return /^[A-Z]{4} \d{3}$/.test(code) ? code.replace(" ", "") + cr(code) : "";
}

/** All distinct 4-letter subject codes in the catalog, e.g. "ENGL", "MEDA". */
export function subjects(): string[] {
  return [...new Set(CATALOG.map(([c]) => c.slice(0, 4)))];
}

/** A placeholder example code for an elective slot's input, guessed from its label/hint. */
export function suggestCode(el: string, hint?: string): string {
  const m = /([A-Z]{4})/.exec(el + " " + (hint ?? ""));
  return m ? m[1] + " 3xx" : "PSYC 101";
}

type ElMatch = NonNullable<ElRow["match"]>;

/**
 * What counts toward an elective slot. `row.match` (set on the handful of rows whose label
 * can't safely be read as a rule — a subject that isn't spelled out, or "subject-or-specific-
 * codes" mixes) wins when present. Otherwise this is read straight off `hint` (a plain
 * comma/"or"-separated subject list, e.g. "ARTM, MUSC or MEDA") or a handful of common label
 * shapes ("PHIL 3000-level courses", "BSTH 310–349", "ENGL course", …). Anything else is
 * genuinely open (transfer credit, "pick your minor", instrument-dependent slots, reaching a
 * credit total) and returns null — no restriction, same as before this existed.
 */
export function elMatch(row: ElRow): ElMatch | null {
  if (row.match) return row.match;

  if (row.hint) {
    const subjects = row.hint
      .split(/,| or /i)
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);
    return subjects.length ? { subjects } : null;
  }

  const label = row.el;

  // A trailing parenthetical that's itself "SUBJ ###–###" or "SUBJ ####-level" is authoritative
  // regardless of whatever descriptive text precedes it, e.g. "New Testament course (BSTH 330–349)".
  let m = label.match(/\(([A-Z]{4}) (\d{3})[–-](\d{3})\)\s*$/);
  if (m) return { subjects: [m[1]], min: Number(m[2]), max: Number(m[3]) };
  m = label.match(/\(([A-Z]{4}) (\d)000-level\)\s*$/);
  if (m) return { subjects: [m[1]], min: Number(m[2]) * 100, max: Number(m[2]) * 100 + 99 };

  // "SUBJ ####-level (not SUBJ ###)" — "course(s)" optional
  m = label.match(/^([A-Z]{4}) (\d)000-level(?: cours?e?s?)?\s*\(not ([A-Z]{4} \d{3})\)$/);
  if (m) return { subjects: [m[1]], min: Number(m[2]) * 100, max: Number(m[2]) * 100 + 99, exclude: [m[3]] };

  // "SUBJ ####-level course(s)"
  m = label.match(/^([A-Z]{4}) (\d)000-level cours?e?s?$/);
  if (m) return { subjects: [m[1]], min: Number(m[2]) * 100, max: Number(m[2]) * 100 + 99 };

  // "SUBJ ###–###" (optionally followed by a parenthetical label)
  m = label.match(/^([A-Z]{4}) (\d{3})[–-](\d{3})(?:\s*\([^)]*\))?$/);
  if (m) return { subjects: [m[1]], min: Number(m[2]), max: Number(m[3]) };

  // "SUBJ course(s)" (any level) or "SUBJ or SUBJ courses" / "SUBJ/SUBJ courses"
  m = label.match(/^([A-Z]{4}) cours?e?s?$/);
  if (m) return { subjects: [m[1]] };
  m = label.match(/^([A-Z]{4})(?:[/]| or )([A-Z]{4}) cours?e?s?$/);
  if (m) return { subjects: [m[1], m[2]] };

  return null;
}

/** Short display text for what an elective slot accepts, when that isn't already obvious from
 * its own label (e.g. "PHIL 3000-level courses" doesn't need one; "Music Ensemble" does). */
export function elMatchLabel(row: ElRow): string | undefined {
  return row.hint ?? row.match?.subjects?.join(" or ");
}

/** Whether a course code counts toward this elective slot. Always true when the slot is open. */
export function elAllows(row: ElRow, code: string): boolean {
  const m = elMatch(row);
  if (!m) return true;
  if (m.exclude?.includes(code)) return false;
  if (m.codes?.includes(code)) return true;
  const subject = code.slice(0, 4);
  if (!m.subjects || !m.subjects.includes(subject)) return false;
  const num = Number(code.slice(5, 8));
  if (m.min != null && num < m.min) return false;
  if (m.max != null && num > m.max) return false;
  return true;
}

/** Parses free-typed input like "ENGL 101 — Introduction to Literature I" (or just a code) into a real catalog code. */
export function codeFromInput(value: string): string | null {
  const v = (value ?? "").trim();
  if (!v) return null;
  const head = v
    .split("—")[0]
    .trim()
    .toUpperCase()
    .replace(/^([A-Z]{4})\s*(\w)/, "$1 $2");
  const t = (v.split("—")[1] ?? "").trim();
  const exact = CATALOG.find(([c, tt]) => shown(c) === head && (!t || tt === t));
  if (exact) return exact[0];
  const byCode = CATALOG.find(([c]) => c === head || c.replace(" ", "") === head.replace(" ", ""));
  return byCode ? byCode[0] : null;
}
