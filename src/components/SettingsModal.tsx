import { useState } from "react";
import type { TrackerState } from "../types";
import { blankState } from "../types";
import { PROGRAMS } from "../data/2026-27/programs";
import { MINORS } from "../data/2026-27/minors";
import { CONC, PROG } from "../lib/requirements";

export function SettingsModal({
  open,
  forced,
  state,
  setState,
  onClose,
}: {
  open: boolean;
  forced: boolean;
  state: TrackerState;
  setState: (updater: (prev: TrackerState) => TrackerState) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(state.name);
  const [program, setProgram] = useState(state.program);
  const [minor, setMinor] = useState(state.minor);
  const [conc, setConc] = useState(state.conc);
  const [confirmReset, setConfirmReset] = useState(false);

  if (!open) return null;

  const groups = [...new Set(PROGRAMS.map((p) => p.group))];
  const chosen = PROG.get(program);
  const concs = chosen?.conc?.map((id) => CONC.get(id)!).filter(Boolean) ?? [];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!program) return;
    setState((prev) => ({
      ...prev,
      name: name.trim().slice(0, 40),
      program,
      minor,
      conc: concs.some((c) => c.id === conc) ? conc : "",
    }));
    onClose();
  };

  return (
    <div className="scrim" role="dialog" aria-modal="true" aria-labelledby="mh">
      <form className="modal" onSubmit={submit}>
        <h2 id="mh">{forced ? "Set up your tracker" : "Settings"}</h2>
        {forced && <p>Pick your program and your requirements load automatically from Tyndale's 2026–27 program sheets.</p>}
        <div className="acct">
          Saving on <b>this device only</b> right now. Signing in to keep it in your account is coming soon.
        </div>
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
          <select className="field" value={program} required onChange={(e) => { setProgram(e.target.value); setConc(""); }}>
            <option value="">Choose your program…</option>
            {groups.map((g) => (
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
        {!forced &&
          (confirmReset ? (
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
          ))}
        <div className="actions">
          {!forced && (
            <button type="button" className="btn ghost" onClick={onClose}>
              Cancel
            </button>
          )}
          <button className="btn" type="submit">
            {forced ? "Start tracking" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
