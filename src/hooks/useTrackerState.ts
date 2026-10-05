import { useCallback, useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { blankState, type TrackerState } from "../types";
import { clearLocal, loadLocal, saveLocal } from "../lib/storage";
import { fetchRemoteState, saveRemoteState } from "../lib/cloudStorage";

// "local" means "signed in, but couldn't reach your account — saved to this device only".
// Signed-out saves (the normal, non-degraded case) are "saved", never "local".
export type SyncStatus = "saving" | "saved" | "local";

function hasData(s: TrackerState): boolean {
  return Boolean(s.program) || Object.keys(s.status).length > 0 || s.classes.length > 0 || s.events.length > 0;
}

/**
 * Holds the tracker state and persists it — to localStorage when signed out, to the
 * `tracker_state` table (mirrored to localStorage too, as an offline cache) when signed in.
 * The first time someone signs in on a device that already has local data and no cloud row
 * yet, `importPrompt` turns on so the UI can ask whether to bring that data into the account.
 */
export function useTrackerState(user: User | null) {
  const [state, setStateRaw] = useState<TrackerState>(() => loadLocal() ?? blankState());
  const [sync, setSync] = useState<SyncStatus>(user ? "saving" : "saved");
  const [importPrompt, setImportPrompt] = useState(false);
  const [busy, setBusy] = useState(false);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstRender = useRef(true);
  const suppressSave = useRef(false);
  const wasSignedIn = useRef(false);
  const userId = user?.id ?? null;

  const setState = useCallback((updater: (prev: TrackerState) => TrackerState) => {
    setStateRaw((prev) => {
      const next = updater(prev);
      next.updated = Date.now();
      return next;
    });
  }, []);

  // When who's signed in changes, load the right source of truth.
  useEffect(() => {
    let cancelled = false;
    if (!userId) {
      suppressSave.current = true;
      if (wasSignedIn.current) {
        // Just signed out (or deleted their account) on this device — the cached copy was
        // only ever a mirror of that account's cloud data, so it can't be left for whoever
        // uses this device next.
        clearLocal();
        setStateRaw(blankState());
      } else {
        setStateRaw(loadLocal() ?? blankState());
      }
      wasSignedIn.current = false;
      setSync("saved");
      setImportPrompt(false);
      return;
    }
    wasSignedIn.current = true;
    setBusy(true);
    fetchRemoteState(userId)
      .then((remote) => {
        if (cancelled) return;
        if (remote && hasData(remote)) {
          // Real cloud data exists — it's the source of truth.
          suppressSave.current = true;
          setStateRaw(remote);
          saveLocal(remote);
          setSync("saved");
        } else if (hasData(state)) {
          // Nothing meaningful in the cloud yet (no row, or an empty one — e.g. created by
          // confirming the sign-up email in a different, data-less browser), but this
          // device has real data. Offer to bring it in rather than silently losing it.
          setImportPrompt(true);
        } else if (!remote) {
          saveRemoteState(userId, state)
            .then(() => !cancelled && setSync("saved"))
            .catch(() => !cancelled && setSync("local"));
        } else {
          setSync("saved");
        }
      })
      .catch(() => !cancelled && setSync("local"))
      .finally(() => !cancelled && setBusy(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when the signed-in user changes
  }, [userId]);

  // Debounced save of every subsequent edit.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (suppressSave.current) {
      suppressSave.current = false;
      return;
    }
    if (importPrompt) return; // don't save until the user resolves the import choice
    setSync("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      saveLocal(state);
      if (userId) {
        saveRemoteState(userId, state)
          .then(() => setSync("saved"))
          .catch(() => setSync("local"));
      } else {
        setSync("saved");
      }
    }, 600);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deliberately excludes importPrompt/userId churn
  }, [state]);

  const resolveImport = useCallback(
    (choice: "import" | "fresh") => {
      if (!userId) return;
      setBusy(true);
      const next = choice === "import" ? state : blankState();
      saveRemoteState(userId, next)
        .then(() => {
          suppressSave.current = true;
          setStateRaw(next);
          saveLocal(next);
          setSync("saved");
          setImportPrompt(false);
        })
        .catch(() => setSync("local"))
        .finally(() => setBusy(false));
    },
    [userId, state],
  );

  return { state, setState, sync, importPrompt, resolveImport, busy };
}
