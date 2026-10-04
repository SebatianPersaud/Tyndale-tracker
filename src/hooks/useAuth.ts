import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase, supabaseConfigured } from "../lib/supabaseClient";

/**
 * Wraps Supabase Auth: who's signed in, and the sign-up/in/out/reset actions.
 * Also tracks whether we're mid password-recovery (the user clicked a reset-password
 * email link) so the UI can show a "set a new password" form instead of the normal one.
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(supabaseConfigured);
  const [passwordRecovery, setPasswordRecovery] = useState(false);

  useEffect(() => {
    if (!supabaseConfigured) return;
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === "PASSWORD_RECOVERY") setPasswordRecovery(true);
      if (event === "SIGNED_OUT") setPasswordRecovery(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return {
    user,
    loading,
    passwordRecovery,
    clearPasswordRecovery: () => setPasswordRecovery(false),
    signUp: (email: string, password: string) => supabase.auth.signUp({ email, password }),
    signIn: (email: string, password: string) => supabase.auth.signInWithPassword({ email, password }),
    signOut: () => supabase.auth.signOut(),
    requestPasswordReset: (email: string) =>
      supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin }),
    updatePassword: (password: string) => supabase.auth.updateUser({ password }),
  };
}
