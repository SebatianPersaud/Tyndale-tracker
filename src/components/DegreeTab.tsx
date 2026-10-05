import { useState } from "react";
import type { TrackerState } from "../types";
import { NEXT_STATUS } from "../types";
import { CONC, MIN, PROG, blockDone, compute } from "../lib/requirements";
import { RequirementBlock } from "./RequirementBlock";

export function DegreeTab({
  state,
  setState,
  onOpenSettings,
}: {
  state: TrackerState;
  setState: (updater: (prev: TrackerState) => TrackerState) => void;
  onOpenSettings: () => void;
}) {
  const [showAll, setShowAll] = useState<Record<string, boolean>>({});
  const p = PROG.get(state.program);

  if (!p) {
    return (
      <div className="empty" style={{ marginTop: 40 }}>
        Choose your program to see your requirements.{" "}
        <button className="btn" style={{ marginLeft: 8 }} onClick={onOpenSettings}>
          Choose program
        </button>
      </div>
    );
  }

  const C = compute(state);
  const tot = p.total;
  const pct = (v: number) => Math.min(100, (v / tot) * 100);
  const m = MIN.get(state.minor);
  const conc = CONC.get(state.conc);
  const hasConc = conc && (p.conc ?? []).includes(conc.id);

  const onCycle = (code: string) =>
    setState((prev) => {
      const next = { ...prev, status: { ...prev.status } };
      const n = NEXT_STATUS[prev.status[code] ?? ""];
      if (n) next.status[code] = n;
      else delete next.status[code];
      return next;
    });

  const onChoose = (key: string, code: string) =>
    setState((prev) => {
      const cur = (prev.choice[key] ?? []).slice();
      if (!cur.includes(code)) cur.push(code);
      const next = {
        ...prev,
        choice: { ...prev.choice, [key]: cur },
        status: prev.status[code] ? prev.status : { ...prev.status, [code]: "p" as const },
      };
      return next;
    });
  const handleChoose = (key: string, code: string) => {
    onChoose(key, code);
    setShowAll((s) => ({ ...s, [key]: false }));
  };

  const onUnchoose = (key: string, code: string) =>
    setState((prev) => {
      const next = { ...prev, choice: { ...prev.choice, [key]: (prev.choice[key] ?? []).filter((c) => c !== code) } };
      if (next.status[code] === "p") {
        next.status = { ...next.status };
        delete next.status[code];
      }
      return next;
    });

  const blocksMet = C.secs.reduce(
    (a, s) => a + s.blocks.filter((b, bi) => blockDone(s, b, bi, C, state) >= b.cr).length,
    0,
  );
  const blocksTotal = C.secs.reduce((a, s) => a + s.blocks.length, 0);
  const coursesDone = Object.values(state.status).filter((x) => x === "d").length;
  const upperNeeded = tot >= 120 ? 45 : 24;

  return (
    <>
      <section className="summary">
        <div>
          <h1>
            {p.cred} in {p.name}
          </h1>
          <div className="sub">
            {state.name && <span>{state.name}</span>}
            <span>{m ? `${m.name} minor` : "No minor"}</span>
            {hasConc && <span>{conc!.name} concentration</span>}
            <span>Min. GPA {p.gpa}</span>
            <span>{p.sheetYear ?? "2026–27"} program sheet</span>
          </div>
        </div>
        <div className="bignum">
          <b>{C.done}</b>
          <span> / {tot} credit hours</span>
        </div>
        <div className="meter">
          <div
            className="track"
            role="img"
            aria-label={`${C.done} done, ${C.prog} in progress, ${C.plan} planned of ${tot}`}
          >
            {/* Apple color restraint: only "in progress" (the one actively-happening state)
                keeps the accent blue; done/planned read as neutral fill vs. outline-weight gray. */}
            <div style={{ width: `${pct(C.done)}%`, background: "var(--fg)" }} />
            <div style={{ width: `${Math.min(pct(C.prog), 100 - pct(C.done))}%`, background: "var(--accent)" }} />
            <div
              style={{
                width: `${Math.max(0, Math.min(pct(C.plan), 100 - pct(C.done) - pct(C.prog)))}%`,
                background: "var(--line-2)",
              }}
            />
          </div>
          <div className="legend">
            <span>
              <i className="sw" style={{ background: "var(--fg)" }} />
              <b>{C.done}</b> done
            </span>
            <span>
              <i className="sw" style={{ background: "var(--accent)" }} />
              <b>{C.prog}</b> in progress
            </span>
            <span>
              <i className="sw" style={{ background: "var(--line-2)" }} />
              <b>{C.plan}</b> planned
            </span>
            <span>
              <b>{Math.max(0, tot - C.done - C.prog - C.plan)}</b> still to plan
            </span>
            <span className="div" />
            <span>
              <b>{C.upper}</b> / {upperNeeded} upper-level
            </span>
            <span>
              <b>{coursesDone}</b> courses done
            </span>
            <span>
              <b>{blocksMet}</b> / {blocksTotal} requirement blocks met
            </span>
          </div>
        </div>
      </section>

      {C.secs.map((s) => (
        <div key={s.key}>
          <div className="section-h">
            <h2>
              <span className="kind">{s.kind}</span> {s.title}
            </h2>
            <a href={s.pdf} target="_blank" rel="noopener noreferrer">
              Official sheet ↗
            </a>
          </div>
          {s.blocks.map((b, bi) => (
            <RequirementBlock
              key={bi}
              section={s}
              block={b}
              blockIndex={bi}
              state={state}
              computed={C}
              onCycle={onCycle}
              onChoose={handleChoose}
              onUnchoose={onUnchoose}
              showAll={showAll}
              onToggleShowAll={(k) => setShowAll((sa) => ({ ...sa, [k]: !sa[k] }))}
            />
          ))}
          {s.notes.length > 0 && (
            <ul className="notes">
              {s.notes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </>
  );
}
