import { TYNDALE_DATES } from "../data/2026-27/dates";
import { TERMS } from "../data/2026-27/terms";
import type { Term, DateKind } from "../data/2026-27/types";
import type { TrackerState } from "../types";
import { shown, title } from "./catalog";

export const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const pad = (n: number): string => String(n).padStart(2, "0");
export const ymd = (d: Date): string => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parseD = (s: string): Date => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

/** Every date that falls inside a Tyndale holiday/reading-day range — classes don't run then. */
const NOCLASS = new Set<string>();
TYNDALE_DATES.forEach(([a, b, , kind]) => {
  if (kind !== "holiday") return;
  for (let d = parseD(a); d <= parseD(b); d.setDate(d.getDate() + 1)) NOCLASS.add(ymd(d));
});

export function fmtTime(t: string | undefined): string {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  return `${(h % 12) || 12}:${pad(m)}${h < 12 ? " am" : " pm"}`;
}

/** Every "HH:MM" time of day on a 5-minute grid, for TimeAutocomplete's suggestion list. */
export const TIME_OPTIONS: string[] = Array.from({ length: 24 * 12 }, (_, i) => {
  const t = `${pad(Math.floor(i / 12))}:${pad((i % 12) * 5)}`;
  return t;
});

/** Lowercase, punctuation/space-stripped, for loose matching ("1030am" / "10:30 am" / "10 30 AM"). */
const compact = (s: string): string => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Parses free-typed input like "10:30am", "1030pm", or an exact "HH:MM" into a real "HH:MM". */
export function timeFromInput(value: string): string | null {
  const v = (value ?? "").trim();
  if (!v) return null;
  if (TIME_OPTIONS.includes(v)) return v;
  const q = compact(v);
  const exact = TIME_OPTIONS.find((t) => compact(fmtTime(t)) === q);
  if (exact) return exact;
  const prefix = TIME_OPTIONS.find((t) => compact(fmtTime(t)).startsWith(q));
  return prefix ?? null;
}

export interface CalendarItem {
  kind: DateKind | "cls" | "mine";
  text: string;
  time: string;
  end?: string;
  sub?: string;
}

/** Everything that happens on one date: Tyndale calendar entries, the student's weekly classes, and their own dates. */
export function itemsOn(ds: string, state: TrackerState): CalendarItem[] {
  const out: CalendarItem[] = [];
  TYNDALE_DATES.forEach(([a, b, n, kind]) => {
    if (ds >= a && ds <= b) out.push({ kind, text: n, time: "" });
  });
  const w = parseD(ds).getDay();
  state.classes.forEach((c) => {
    const term = TERMS.find((t) => t.id === c.term);
    if (!term) return;
    if (ds >= term.start && ds <= term.end && c.days.includes(w) && !NOCLASS.has(ds)) {
      out.push({
        kind: "cls",
        text: shown(c.code) + (c.room ? " · " + c.room : ""),
        time: c.start,
        end: c.end,
        sub: title(c.code),
      });
    }
  });
  state.events.forEach((e) => {
    if (e.date === ds) out.push({ kind: "mine", text: e.title, time: e.time || "" });
  });
  return out.sort((a, b) => (a.time || "00:00").localeCompare(b.time || "00:00"));
}

export interface NextUp {
  it: CalendarItem;
  at: Date;
}

/** The next upcoming class, deadline, exam, term date or personal event, scanning up to ~8 months ahead. */
export function nextUp(state: TrackerState, now: Date = new Date()): NextUp | null {
  for (let i = 0; i < 240; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    const ds = ymd(d);
    const items = itemsOn(ds, state).filter((x) =>
      ["cls", "mine", "deadline", "exam", "term"].includes(x.kind),
    );
    for (const it of items) {
      const [h, m] = (it.time || "09:00").split(":").map(Number);
      const at = new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, m);
      if (at > now) return { it, at };
    }
  }
  return null;
}

/** Formats a countdown like "3d 04h 12m 05s" to the given target time. */
export function countdown(at: Date, now: Date = new Date()): string {
  let s = Math.max(0, Math.floor((at.getTime() - now.getTime()) / 1000));
  const d = Math.floor(s / 86400);
  s %= 86400;
  const h = Math.floor(s / 3600);
  s %= 3600;
  const m = Math.floor(s / 60);
  s %= 60;
  return `${d ? d + "d " : ""}${pad(h)}h ${pad(m)}m ${pad(s)}s`;
}

export interface TermProgress {
  t: Term;
  pct: number;
  label: string;
}

/** The current (or next upcoming) term, with how far through it we are. */
export function termProgress(now: Date = new Date()): TermProgress {
  const nowDs = ymd(now);
  const t = TERMS.find((term) => nowDs <= term.end) ?? TERMS[TERMS.length - 1];
  const s = parseD(t.start),
    e = parseD(t.end);
  const pct = Math.max(0, Math.min(100, ((now.getTime() - s.getTime()) / (e.getTime() - s.getTime())) * 100));
  const days = Math.ceil((e.getTime() - now.getTime()) / 86400000);
  const label =
    now < s
      ? `Starts in ${Math.ceil((s.getTime() - now.getTime()) / 86400000)} days`
      : days >= 0
        ? `${days} days of classes left`
        : "Finished";
  return { t, pct, label };
}
