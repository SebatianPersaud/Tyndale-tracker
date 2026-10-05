import { useState } from "react";
import type { useAuth } from "../hooks/useAuth";

type View = "signin" | "signup" | "forgot" | "checkEmailSignup" | "checkEmailReset";

/**
 * The account area shown in Settings: sign in/up/out, forgot-password, and (when the user
 * arrived via a password-reset email link) a "set a new password" form. Supabase Auth does
 * all the actual credential handling — this only calls its methods and shows the result.
 */
export function AuthPanel({
  auth,
  initialView = "signin",
}: {
  auth: ReturnType<typeof useAuth>;
  initialView?: "signin" | "signup";
}) {
  const { user, passwordRecovery } = auth;

  if (passwordRecovery) return <SetNewPassword auth={auth} />;
  if (user) return <AccountInfo auth={auth} />;
  return <SignedOutForms auth={auth} initialView={initialView} />;
}

function SignedOutForms({ auth, initialView }: { auth: ReturnType<typeof useAuth>; initialView: "signin" | "signup" }) {
  const [view, setView] = useState<View>(initialView);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  if (view === "checkEmailSignup") {
    return (
      <div className="acct">
        Almost there — we sent a confirmation link to <b>{email}</b>. Click it to activate your account, then sign
        in here.
      </div>
    );
  }
  if (view === "checkEmailReset") {
    return (
      <div className="acct">
        If <b>{email}</b> has an account, a password reset link is on its way. Click it to set a new password.
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      if (view === "signup") {
        const { error } = await auth.signUp(email, password);
        if (error) throw error;
        setView("checkEmailSignup");
      } else if (view === "forgot") {
        const { error } = await auth.requestPasswordReset(email);
        if (error) throw error;
        setView("checkEmailReset");
      } else {
        const { error } = await auth.signIn(email, password);
        if (error) throw error;
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="acct" style={{ flexDirection: "column", alignItems: "stretch", gap: 12 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <b>{view === "signup" ? "Create an account" : view === "forgot" ? "Reset your password" : "Sign in"}</b>
      </div>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <input
          className="field"
          type="email"
          placeholder="you@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        {view !== "forgot" && (
          <input
            className="field"
            type="password"
            placeholder={view === "signup" ? "Create a password (6+ characters)" : "Password"}
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={view === "signup" ? "new-password" : "current-password"}
          />
        )}
        {err && <span className="err">{err}</span>}
        <button className="btn" type="submit" disabled={busy}>
          {busy ? "Working…" : view === "signup" ? "Sign up" : view === "forgot" ? "Send reset link" : "Sign in"}
        </button>
      </form>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
        {view === "signin" && (
          <>
            <button type="button" className="linkbtn" onClick={() => setView("signup")}>
              Need an account? Sign up
            </button>
            <button type="button" className="linkbtn" onClick={() => setView("forgot")}>
              Forgot password?
            </button>
          </>
        )}
        {view !== "signin" && (
          <button type="button" className="linkbtn" onClick={() => setView("signin")}>
            Back to sign in
          </button>
        )}
      </div>
      <p className="muted" style={{ margin: 0, fontSize: 12 }}>
        Signing in keeps your tracker saved to your account on any device. You can keep using the tracker without an
        account — it just stays on this device only.
      </p>
    </div>
  );
}

function SetNewPassword({ auth }: { auth: ReturnType<typeof useAuth> }) {
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  if (done) return <div className="acct">Your password's been updated.</div>;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const { error } = await auth.updatePassword(password);
      if (error) throw error;
      setDone(true);
      auth.clearPasswordRecovery();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="acct" style={{ flexDirection: "column", alignItems: "stretch", gap: 12 }}>
      <b>Set a new password</b>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <input
          className="field"
          type="password"
          placeholder="New password (6+ characters)"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />
        {err && <span className="err">{err}</span>}
        <button className="btn" type="submit" disabled={busy}>
          {busy ? "Working…" : "Set password"}
        </button>
      </form>
    </div>
  );
}

function AccountInfo({ auth }: { auth: ReturnType<typeof useAuth> }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [err, setErr] = useState("");

  const doDelete = async () => {
    setDeleting(true);
    setErr("");
    try {
      const { deleteAccount } = await import("../lib/accountDeletion");
      await deleteAccount();
      await auth.signOut();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Couldn't delete your account — try again in a bit.");
      setDeleting(false);
    }
  };

  return (
    <div className="acct" style={{ flexDirection: "column", alignItems: "stretch", gap: 12 }}>
      <span>
        Signed in as <b>{auth.user?.email}</b>. Your tracker is saved to your account.
      </span>
      <div className="actions" style={{ justifyContent: "flex-start" }}>
        <button type="button" className="btn ghost" onClick={() => auth.signOut()}>
          Sign out
        </button>
      </div>
      {confirmDelete ? (
        <>
          <div className="acct" style={{ background: "var(--hol-soft)" }}>
            <span>
              Delete your account and everything in it — your email, and every course, class and date you've
              added? This can't be undone.
            </span>
          </div>
          {err && <span className="err">{err}</span>}
          <div className="actions">
            <button type="button" className="btn ghost" onClick={() => setConfirmDelete(false)} disabled={deleting}>
              Keep my account
            </button>
            <button type="button" className="btn danger" onClick={doDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete my account and data"}
            </button>
          </div>
        </>
      ) : (
        <button
          type="button"
          className="linkbtn"
          style={{ alignSelf: "flex-start", color: "var(--hol)" }}
          onClick={() => setConfirmDelete(true)}
        >
          Delete my account and data…
        </button>
      )}
    </div>
  );
}
