import { supabase } from "./supabaseClient";

/**
 * Permanently deletes the signed-in user's account and all their data.
 * Calls the `delete-account` Edge Function (supabase/functions/delete-account) because
 * actually deleting an auth user requires the service_role key, which must never reach
 * the browser — the function holds that key server-side and checks the caller's own
 * session before doing anything.
 */
export async function deleteAccount(): Promise<void> {
  const { error } = await supabase.functions.invoke("delete-account", { method: "POST" });
  if (error) throw error;
}
