import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** True once VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env.local. */
export const supabaseConfigured = Boolean(url && anonKey);

if (!supabaseConfigured) {
  console.warn(
    "Supabase isn't configured (missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in .env.local). " +
      "Accounts and cloud saving are disabled; the tracker still works locally.",
  );
}

// Falls back to a placeholder so createClient doesn't throw when env vars are missing
// (e.g. running the app before Supabase is set up) — supabaseConfigured gates all real use.
export const supabase = createClient(url || "https://placeholder.supabase.co", anonKey || "placeholder-key");
