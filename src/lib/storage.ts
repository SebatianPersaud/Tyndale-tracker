import { blankState, type TrackerState } from "../types";

const LKEY = "tdt-state-v1";
const TAB_KEY = "tdt-tab";

export function loadLocal(): TrackerState | null {
  try {
    const j = localStorage.getItem(LKEY);
    if (!j) return null;
    return Object.assign(blankState(), JSON.parse(j));
  } catch {
    return null;
  }
}

export function saveLocal(state: TrackerState): void {
  try {
    localStorage.setItem(LKEY, JSON.stringify(state));
  } catch {
    // localStorage can be unavailable (private browsing, quota) — saving just silently no-ops.
  }
}

/** Wipes the cached tracker on sign-out/account-deletion so it can't linger for the next
 *  person on a shared device — the signed-in copy was always just a mirror of the cloud row. */
export function clearLocal(): void {
  try {
    localStorage.removeItem(LKEY);
  } catch {
    // ignore
  }
}

export function loadTab(): string | null {
  try {
    return localStorage.getItem(TAB_KEY);
  } catch {
    return null;
  }
}

export function saveTab(tab: string): void {
  try {
    localStorage.setItem(TAB_KEY, tab);
  } catch {
    // ignore
  }
}
