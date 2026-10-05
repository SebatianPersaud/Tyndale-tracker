import { CATALOG } from "../data/2026-27/catalog";
import { CREDIT_OVERRIDES } from "../data/2026-27/creditOverrides";
import { COURSE_DESCRIPTIONS } from "../data/2026-27/courseDescriptions";

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
