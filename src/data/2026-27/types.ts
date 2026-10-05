// Shapes for Tyndale's 2026-27 program requirements.
// A requirement block's rows can take one of four forms:
//   "CODE"                         a specific course, required
//   {pick:n, of:[...]}             choose n courses from this list
//   {pool:[...], label, cr}        choose any combination from this list, toward cr credit hours
//   {el:"label", cr}               an elective slot the student fills in themselves
//   {free:n}                       n credit hours of free electives, filled automatically
export interface PickRow {
  pick: number;
  of: string[];
  label?: string;
  cr?: number; // rare: overrides the default pick*3 credit target
  oneTrack?: boolean; // once any option is chosen, only its subject (e.g. GREE/HEBR) stays offered
}
export interface PoolRow {
  pool: string[];
  label: string;
  cr: number;
  oneTrack?: boolean; // once any option is chosen, only its subject (e.g. GREE/HEBR) stays offered
}
export interface ElRow {
  el: string;
  cr: number;
  hint?: string;
}
export interface FreeRow {
  free: number;
}
export type Row = string | PickRow | PoolRow | ElRow | FreeRow;

export type Block = [label: string, cr: number, rows: Row[]];

export interface Program {
  id: string;
  group: string;
  name: string;
  cred: string;
  total: number;
  gpa: string;
  pdf: string;
  conc?: string[];
  sheetYear?: string;
  blocks: Block[];
  notes?: string[];
}

export interface Minor {
  id: string;
  name: string;
  total: number;
  pdf: string;
  rows: Row[];
  note?: string;
}

export interface Concentration {
  id: string;
  name: string;
  total: number;
  pdf: string;
  rows: Row[];
  note?: string;
}

export type CreditOverrides = Record<string, number>;

export type DateKind = "deadline" | "term" | "holiday" | "exam";
export type DateRow = [start: string, end: string, label: string, kind: DateKind];

export interface Term {
  id: string;
  name: string;
  start: string;
  end: string;
}

export type CatalogEntry = [code: string, title: string];

// Official description + prerequisite text from tyndale.ca/course?code=<SUBJECT>. Not every
// catalog code has an entry here — thesis codes, Media Arts placeholder codes, and applied
// music/ensemble range codes aren't listed as standalone entries on the live site.
export type CourseDescriptions = Record<string, { description: string; prereq: string | null }>;
