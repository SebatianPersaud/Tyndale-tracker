import { useCallback, useEffect, useRef, useState } from "react";
import { blankState, type TrackerState } from "../types";
import { loadLocal, saveLocal } from "../lib/storage";

export type SyncStatus = "saving" | "saved";

/**
 * Holds the tracker state, persists it to localStorage, and reports a "Saving… / Saved"
 * status the same way the prototype did (debounced by ~600ms so rapid edits don't thrash
 * localStorage). Milestone 2 swaps the save target to Supabase without changing callers.
 */
export function useTrackerState() {
  const [state, setStateRaw] = useState<TrackerState>(() => loadLocal() ?? blankState());
  const [sync, setSync] = useState<SyncStatus>("saved");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstRender = useRef(true);

  const setState = useCallback((updater: (prev: TrackerState) => TrackerState) => {
    setStateRaw((prev) => {
      const next = updater(prev);
      next.updated = Date.now();
      return next;
    });
  }, []);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setSync("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      saveLocal(state);
      setSync("saved");
    }, 600);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [state]);

  return { state, setState, sync };
}
