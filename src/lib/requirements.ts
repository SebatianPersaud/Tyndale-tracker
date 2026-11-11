import { PROGRAMS } from "../data/2026-27/programs";
import { MINORS } from "../data/2026-27/minors";
import { CONCENTRATIONS } from "../data/2026-27/concentrations";
import type { Block, PickRow, PoolRow, ElRow, FreeRow, Row } from "../data/2026-27/types";
import type { TrackerState } from "../types";
import { cr, elAllows, elMatch, lvl } from "./catalog";

export const PROG = new Map(PROGRAMS.map((p) => [p.id, p]));
export const MIN = new Map(MINORS.map((m) => [m.id, m]));
export const CONC = new Map(CONCENTRATIONS.map((c) => [c.id, c]));

function isPick(row: Row): row is PickRow {
  return typeof row !== "string" && "pick" in row;
}
function isPool(row: Row): row is PoolRow {
  return typeof row !== "string" && "pool" in row;
}
function isEl(row: Row): row is ElRow {
  return typeof row !== "string" && "el" in row;
}
function isFree(row: Row): row is FreeRow {
  return typeof row !== "string" && "free" in row;
}

/** The course codes a row offers (its "of" list for a pick row, "pool" for a pool row). */
export function rowCodes(row: Row): string[] {
  if (typeof row === "string") return [row];
  if (isPick(row)) return row.of;
  if (isPool(row)) return row.pool;
  return [];
}

/**
 * The courses actually counted toward a row: whatever the student explicitly chose for it,
 * plus any course they've marked with a status (anywhere — including straight from the
 * Courses tab) that fits the row's own criteria, auto-filled up to the row's cap. For
 * pick/pool rows that's the row's fixed option list, capped by count; for an elective row
 * it's whatever `elAllows` accepts for that slot (e.g. a Fine Arts elective takes any marked
 * ARTM/MUSC/MEDA course), capped by credit hours since its courses aren't all the same size.
 *
 * An elective row only auto-fills when `elMatch` actually knows what it wants. A row left
 * unrestricted because nothing could say what counts (a generic "reach 60 credit hours"
 * elective) is one thing; "Transfer courses", "Minor courses", or a diploma-credit row are
 * unrestricted for a different reason — no ordinary Tyndale course a student marks here is
 * ever what those represent — so guessing by grabbing whatever's marked would be wrong, not
 * just imprecise. Both stay explicit-only, same as before this existed.
 */
export function effChoice(row: Row, key: string, state: TrackerState): string[] {
  const explicit = (state.choice[key] ?? []).slice();
  if (isEl(row)) {
    let sum = explicit.reduce((a, c) => a + cr(c), 0);
    if (sum >= row.cr || !elMatch(row)) return explicit;
    const out = explicit.slice();
    for (const c of Object.keys(state.status)) {
      if (sum >= row.cr) break;
      if (explicit.includes(c) || !elAllows(row, c)) continue;
      out.push(c);
      sum += cr(c);
    }
    return out;
  }
  const opts = rowCodes(row);
  const cap = isPick(row) ? row.pick : Infinity;
  for (const o of opts) {
    if (explicit.length >= cap) break;
    if (state.status[o] && !explicit.includes(o)) explicit.push(o);
  }
  return explicit.filter((c) => opts.includes(c)).slice(0, cap);
}

/** The courses a row currently counts (empty for a free-elective row — those fill from leftovers). */
export function rowCourses(row: Row, key: string, state: TrackerState): string[] {
  if (typeof row === "string") return [row];
  if (isFree(row)) return [];
  return effChoice(row, key, state);
}

/** The credit-hour target a row is worth. */
export function rowTarget(row: Row): number {
  if (typeof row === "string") return cr(row);
  if (isFree(row)) return row.free;
  if (isEl(row)) return row.cr;
  if (isPick(row)) return row.cr ?? row.pick * 3;
  return row.cr ?? 0;
}

/**
 * How many more "add a course" boxes an elective row needs. Courses don't all cost the same
 * credits (an Applied Music lesson can be 1 or 2, not the usual 3), so this sums what's
 * actually chosen rather than counting courses — one 1-credit pick must not read as "this
 * 3-credit row is full" and hide the box to add a second course. Still offers the count-based
 * number of boxes up front when nothing's missing credit-wise, so an all-3-credit row can be
 * filled in parallel like before; otherwise always at least one box, however many it already took.
 */
export function elSlotsRemaining(row: ElRow, chosen: string[]): number {
  const filled = chosen.reduce((a, c) => a + cr(c), 0);
  if (filled >= row.cr) return 0;
  return Math.max(1, Math.ceil(row.cr / 3) - chosen.length);
}

export interface ResolvedBlock {
  t: string;
  cr: number;
  rows: Row[];
}

export interface ResolvedSection {
  kind: "Major" | "Minor" | "Concentration";
  key: string;
  title: string;
  pdf: string;
  blocks: ResolvedBlock[];
  notes: string[];
  year?: string;
}

function resolveBlock(b: Block): ResolvedBlock {
  return { t: b[0], cr: b[1], rows: b[2] };
}

/** The Major (+ optional Concentration) and Minor sections that apply to the student's chosen program. */
export function sections(state: TrackerState): ResolvedSection[] {
  const out: ResolvedSection[] = [];
  const p = PROG.get(state.program);
  if (!p) return out;
  out.push({
    kind: "Major",
    key: p.id,
    title: p.cred + " " + p.name,
    pdf: p.pdf,
    blocks: p.blocks.map(resolveBlock),
    notes: p.notes ?? [],
    year: p.sheetYear,
  });
  const c = CONC.get(state.conc);
  if (c && (p.conc ?? []).includes(c.id)) {
    out.push({
      kind: "Concentration",
      key: c.id,
      title: c.name + " concentration",
      pdf: c.pdf,
      blocks: [{ t: "Concentration requirements", cr: c.total, rows: c.rows }],
      notes: c.note ? [c.note] : [],
    });
  }
  const m = MIN.get(state.minor);
  if (m) {
    out.push({
      kind: "Minor",
      key: m.id,
      title: m.name + " minor",
      pdf: m.pdf,
      blocks: [{ t: "Minor requirements", cr: m.total, rows: m.rows }],
      notes: m.note ? [m.note] : [],
    });
  }
  return out;
}

/** Every course code named anywhere in the student's Major/Concentration/Minor requirements
 *  (not their own choices for {el}/{free} slots, which have no fixed codes to list). */
export function requirementCodes(state: TrackerState): Set<string> {
  const out = new Set<string>();
  sections(state).forEach((s) => s.blocks.forEach((b) => b.rows.forEach((r) => rowCodes(r).forEach((c) => out.add(c)))));
  return out;
}

export interface Computed {
  secs: ResolvedSection[];
  done: number;
  prog: number;
  plan: number;
  upper: number;
  leftoverAny: string[];
  freeFill: Record<string, number>;
}

/** Row key: unique per section/block/row so choices and free-fill amounts can be looked up. */
export function rowKey(sectionKey: string, blockIndex: number, rowIndex: number): string {
  return `${sectionKey}:${blockIndex}:${rowIndex}`;
}

/**
 * The whole-tracker summary: credit totals by status, upper-level credit count, which marked
 * courses aren't claimed by any requirement row (so they can fill free-elective slots instead),
 * and how many credit hours of each free-elective row that leftover pool actually fills.
 */
export function compute(state: TrackerState): Computed {
  const secs = sections(state);
  const used = new Set<string>();
  secs.forEach((s) =>
    s.blocks.forEach((b, bi) =>
      b.rows.forEach((r, ri) => rowCourses(r, rowKey(s.key, bi, ri), state).forEach((c) => used.add(c))),
    ),
  );
  const all = Object.keys(state.status).filter((c) => state.status[c]);
  const sum = (st: string) => all.filter((c) => state.status[c] === st).reduce((a, c) => a + cr(c), 0);
  const leftoverDone = all.filter((c) => state.status[c] === "d" && !used.has(c));
  const leftoverAny = all.filter((c) => !used.has(c));
  let freePool = leftoverDone.reduce((a, c) => a + cr(c), 0);
  const freeFill: Record<string, number> = {};
  secs.forEach((s) =>
    s.blocks.forEach((b, bi) =>
      b.rows.forEach((r, ri) => {
        if (isFree(r)) {
          const k = rowKey(s.key, bi, ri);
          const take = Math.min(r.free, freePool);
          freeFill[k] = take;
          freePool -= take;
        }
      }),
    ),
  );
  return {
    secs,
    done: sum("d"),
    prog: sum("i"),
    plan: sum("p"),
    upper: all.filter((c) => state.status[c] === "d" && lvl(c) >= 3).reduce((a, c) => a + cr(c), 0),
    leftoverAny,
    freeFill,
  };
}

/** Credit hours completed within one block (capped at the block's own total). */
export function blockDone(s: ResolvedSection, b: ResolvedBlock, bi: number, C: Computed, state: TrackerState): number {
  let n = 0;
  b.rows.forEach((r, ri) => {
    const k = rowKey(s.key, bi, ri);
    if (isFree(r)) {
      n += C.freeFill[k] ?? 0;
      return;
    }
    let got = rowCourses(r, k, state)
      .filter((c) => state.status[c] === "d")
      .reduce((a, c) => a + cr(c), 0);
    if (isEl(r) || isPick(r) || isPool(r)) got = Math.min(got, rowTarget(r));
    n += got;
  });
  return Math.min(n, b.cr);
}
