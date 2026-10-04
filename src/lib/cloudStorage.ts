import { blankState, type TrackerState } from "../types";
import { supabase } from "./supabaseClient";

const TABLE = "tracker_state";

/** The signed-in user's saved state, or null if they don't have a row yet. */
export async function fetchRemoteState(userId: string): Promise<TrackerState | null> {
  const { data, error } = await supabase.from(TABLE).select("state").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return Object.assign(blankState(), data.state as Partial<TrackerState>);
}

/** Creates or overwrites the signed-in user's row with the given state. */
export async function saveRemoteState(userId: string, state: TrackerState): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .upsert({ user_id: userId, state, updated_at: new Date().toISOString() });
  if (error) throw error;
}
