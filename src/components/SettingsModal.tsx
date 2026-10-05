import { useState } from "react";
import type { TrackerState } from "../types";
import { blankState } from "../types";
import { PROGRAMS } from "../data/2026-27/programs";
import { MINORS } from "../data/2026-27/minors";
import { CONC, PROG } from "../lib/requirements";
import type { useAuth } from "../hooks/useAuth";
import { AuthPanel } from "./AuthPanel";

export function SettingsModal({
  open,
  forced,
  state,
  setState,
  onClose,
  auth,
  onOpenPrivacy,
}: {
  open: boolean;
  forced: boolean;
  state: TrackerState;
  setState: (updater: (prev: TrackerState) => TrackerState) => void;
  onClose: () => void;
  auth: ReturnType<typeof useAuth>;
  onOpenPrivacy: () => void;
}) {
  const [name, setName] = useState(state.name);
  const [program, setProgram] = useState(state.program);
  const [minor, setMinor] = useState(state.minor);
  const [conc, setConc] = useState(state.conc);
  const [confirmReset, setConfirmReset] = useState(false);
  const [wantsLocalOnly, setWantsLocalOnly] = useState(false);

  if (!open) return null;

  // Password recovery is a one-thing-only moment — nothing else belongs on screen with it.
  if (auth.passwordRecovery) {
    return (
      <div className="scrim" role="dialog" aria-modal="true" aria-labelledby="mh">
        <div className="modal">
          <h2 id="mh">Reset your password</h2>
          <AuthPanel auth={auth} />
        </div>
      </div>
    );
  }

  // First-time setup, not signed in yet: lead with account creation (fastest way to get a
  // synced account going), with picking a program locally as the one-click-away alternative.
  if (forced && !auth.user) {
    if (!wantsLocalOnly) {
      return (
        <div className="scrim" role="dialog" aria-modal="true" aria-labelledby="mh">
          <div className="modal">
            <h2 id="mh">Welcome</h2>
            <p>Create an account to keep your tracker saved and synced across devices.</p>
            <AuthPanel auth={auth} initialView="signup" />
            <button type="button" className="linkbtn" style={{ alignSelf: "flex-start" }} onClick={() => setWantsLocalOnly(true)}>
              Continue without an account →
            </button>
          </div>
        </div>
      );
    }
    return (
      <div className="scrim" role="dialog" aria-modal="true" aria-labelledby="mh">
        <div className="modal">
          <h2 id="mh">Set up your tracker</h2>
          <p>Pick your program and your requirements load automatically from Tyndale's 2026–27 program sheets.</p>
          <ProfileForm
            name={name}
            setName={setName}
            program={program}
            setProgram={setProgram}
            minor={minor}
            setMinor={setMinor}
            conc={conc}
            setConc={setConc}
            onSubmit={() => {
              setState((prev) => ({
                ...prev,
                name: name.trim().slice(0, 40),
                program,
                minor,
                conc: concOf(program).some((c) => c.id === conc) ? conc : "",
              }));
            }}
          />
          <button type="button" className="linkbtn" style={{ alignSelf: "flex-start" }} onClick={() => setWantsLocalOnly(false)}>
            ← Back to creating an account
          </button>
          <button type="button" className="linkbtn" onClick={onOpenPrivacy}>
            Privacy
          </button>
        </div>
      </div>
    );
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!program) return;
    setState((prev) => ({
      ...prev,
      name: name.trim().slice(0, 40),
      program,
      minor,
      conc: concOf(program).some((c) => c.id === conc) ? conc : "",
    }));
    onClose();
  };

  return (
    <div className="scrim" role="dialog" aria-modal="true" aria-labelledby="mh">
      {/* Not a <form> itself — AuthPanel below renders its own forms (sign in/up, reset),
          and HTML doesn't allow nesting a <form> inside another one. */}
      <div className="modal">
        <h2 id="mh">Settings</h2>
        <AuthPanel auth={auth} />
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <label>
            Your first name
            <input
              className="field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Optional"
              autoComplete="given-name"
            />
          </label>
          <label>
            Degree program
            <select
              className="field"
              value={program}
              required
              onChange={(e) => {
                setProgram(e.target.value);
                setConc("");
              }}
            >
              <option value="">Choose your program…</option>
              {groups().map((g) => (
                <optgroup label={g} key={g}>
                  {PROGRAMS.filter((x) => x.group === g).map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.name}
                      {x.cred.includes("Honours") && !x.name.includes("Honours") ? " (Honours)" : ""}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
          <label>
            Minor
            <select className="field" value={minor} onChange={(e) => setMinor(e.target.value)}>
              <option value="">No minor</option>
              {MINORS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.total} cr)
                </option>
              ))}
            </select>
          </label>
          {concOf(program).length > 0 && (
            <label>
              Concentration
              <select className="field" value={conc} onChange={(e) => setConc(e.target.value)}>
                <option value="">None</option>
                {concOf(program).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          {confirmReset ? (
            <>
              <div className="acct" style={{ background: "var(--hol-soft)" }}>
                <span>Erase every course, class and date you've added? This can't be undone.</span>
              </div>
              <div className="actions">
                <button type="button" className="btn ghost" onClick={() => setConfirmReset(false)}>
                  Keep my data
                </button>
                <button
                  type="button"
                  className="btn danger"
                  onClick={() => {
                    setState(() => blankState());
                    setConfirmReset(false);
                    onClose();
                  }}
                >
                  Erase everything
                </button>
              </div>
            </>
          ) : (
            <button
              type="button"
              className="linkbtn"
              style={{ alignSelf: "flex-start", color: "var(--hol)" }}
              onClick={() => setConfirmReset(true)}
            >
              Start over…
            </button>
          )}
          <div className="actions" style={{ justifyContent: "space-between" }}>
            <button type="button" className="linkbtn" onClick={onOpenPrivacy}>
              Privacy
            </button>
            <div className="actions">
              <button type="button" className="btn ghost" onClick={onClose}>
                Cancel
              </button>
              <button className="btn" type="submit">
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function groups(): string[] {
  return [...new Set(PROGRAMS.map((p) => p.group))];
}

function concOf(programId: string) {
  const chosen = PROG.get(programId);
  return chosen?.conc?.map((id) => CONC.get(id)!).filter(Boolean) ?? [];
}

/** The name/program/minor/concentration fields, used by the forced first-run view. */
function ProfileForm({
  name,
  setName,
  program,
  setProgram,
  minor,
  setMinor,
  conc,
  setConc,
  onSubmit,
}: {
  name: string;
  setName: (v: string) => void;
  program: string;
  setProgram: (v: string) => void;
  minor: string;
  setMinor: (v: string) => void;
  conc: string;
  setConc: (v: string) => void;
  onSubmit: () => void;
}) {
  const concs = concOf(program);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      style={{ display: "flex", flexDirection: "column", gap: 16 }}
    >
      <label>
        Your first name
        <input
          className="field"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Optional"
          autoComplete="given-name"
        />
      </label>
      <label>
        Degree program
        <select
          className="field"
          value={program}
          required
          onChange={(e) => {
            setProgram(e.target.value);
            setConc("");
          }}
        >
          <option value="">Choose your program…</option>
          {groups().map((g) => (
            <optgroup label={g} key={g}>
              {PROGRAMS.filter((x) => x.group === g).map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name}
                  {x.cred.includes("Honours") && !x.name.includes("Honours") ? " (Honours)" : ""}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>
      <label>
        Minor
        <select className="field" value={minor} onChange={(e) => setMinor(e.target.value)}>
          <option value="">No minor</option>
          {MINORS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} ({m.total} cr)
            </option>
          ))}
        </select>
      </label>
      {concs.length > 0 && (
        <label>
          Concentration
          <select className="field" value={conc} onChange={(e) => setConc(e.target.value)}>
            <option value="">None</option>
            {concs.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      )}
      <div className="actions">
        <button className="btn" type="submit">
          Start tracking
        </button>
      </div>
    </form>
  );
}
