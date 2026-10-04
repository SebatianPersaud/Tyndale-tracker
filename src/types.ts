// The shape of one user's saved tracker data. Matches what gets persisted
// (to localStorage for now; to Supabase from milestone 2 on).
export interface ClassEntry {
  id: string;
  code: string;
  days: number[]; // 0=Sun .. 6=Sat
  start: string; // "HH:MM"
  end: string; // "HH:MM"
  term: string; // Term id
  room: string;
}

export interface EventEntry {
  id: string;
  title: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:MM" or ""
}

export interface TrackerState {
  v: 1;
  name: string;
  program: string;
  minor: string;
  conc: string;
  status: Record<string, Status>;
  choice: Record<string, string[]>;
  classes: ClassEntry[];
  events: EventEntry[];
  updated: number;
}

export type Status = "" | "p" | "i" | "d";

export const STATUS_LABEL: Record<Status, string> = {
  "": "Not started",
  p: "Planned",
  i: "In progress",
  d: "Done",
};

export const NEXT_STATUS: Record<Status, Status> = {
  "": "p",
  p: "i",
  i: "d",
  d: "",
};

export function blankState(): TrackerState {
  return {
    v: 1,
    name: "",
    program: "",
    minor: "",
    conc: "",
    status: {},
    choice: {},
    classes: [],
    events: [],
    updated: 0,
  };
}
