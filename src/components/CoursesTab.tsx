import { useState } from "react";
import { CATALOG } from "../data/2026-27/catalog";
import type { TrackerState } from "../types";
import { NEXT_STATUS, type Status } from "../types";
import { cr, regCode, shown, subjects, title } from "../lib/catalog";
import { Pill } from "./Pill";

const SHOWN_LIMIT = 200;

export function CoursesTab({
  state,
  setState,
}: {
  state: TrackerState;
  setState: (updater: (prev: TrackerState) => TrackerState) => void;
}) {
  const [q, setQ] = useState("");
  const [subj, setSubj] = useState("");
  const [filter, setFilter] = useState("");
  const subs = subjects();

  const query = q.trim().toLowerCase();
  const list = CATALOG.filter(([c, t]) => {
    if (subj && !c.startsWith(subj)) return false;
    if (query && !(c.toLowerCase().includes(query) || t.toLowerCase().includes(query) || c.replace(" ", "").toLowerCase().includes(query)))
      return false;
    if (filter === "mine" && !state.status[c]) return false;
    if (filter && filter !== "mine" && (state.status[c] ?? "") !== filter) return false;
    return true;
  });
  const shownList = list.slice(0, SHOWN_LIMIT);

  const onCycle = (code: string) =>
    setState((prev) => {
      const next = { ...prev, status: { ...prev.status } };
      const n = NEXT_STATUS[prev.status[code] ?? ""];
      if (n) next.status[code] = n;
      else delete next.status[code];
      return next;
    });

  return (
    <>
      <div className="toolbar">
        <input
          className="field grow"
          type="search"
          placeholder={`Search ${CATALOG.length} courses by code or title`}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search courses"
        />
        <select className="field" value={subj} onChange={(e) => setSubj(e.target.value)} aria-label="Subject">
          <option value="">All subjects</option>
          {subs.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select className="field" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Status">
          <option value="">Any status</option>
          <option value="mine">On my plan</option>
          <option value="d">Done</option>
          <option value="i">In progress</option>
          <option value="p">Planned</option>
        </select>
      </div>
      <p className="muted" style={{ fontSize: 13, margin: "10px 2px 0" }}>
        {list.length} course{list.length === 1 ? "" : "s"}
        {list.length > SHOWN_LIMIT ? ` · showing the first ${SHOWN_LIMIT}` : ""}. Tap a status to add a course to
        your plan; it counts toward any requirement it fits, otherwise toward your electives.
      </p>
      <div className="cat">
        {shownList.length ? (
          shownList.map(([c]) => {
            const rc = regCode(c);
            return (
              <div className="course" key={c}>
                <Pill code={c} status={(state.status[c] ?? "") as Status} onCycle={onCycle} />
                <div className="ct">
                  <span className="code">{shown(c)}</span> <span className="title">{title(c)}</span>
                </div>
                <span className="crs">
                  {cr(c)} cr{rc && <span className="regc" title="How it appears in the timetable">{rc}</span>}
                </span>
              </div>
            );
          })
        ) : (
          <div className="empty">No courses match. Try a code like "MEDA" or a word like "film".</div>
        )}
      </div>
    </>
  );
}
