import { useEffect, useMemo, useState } from "react";
import type { TrackerState, ClassEntry, EventEntry } from "../types";
import { TERMS } from "../data/2026-27/terms";
import { DOW, countdown, dateFromInput, fmtDate, fmtTime, itemsOn, nextUp, parseD, termProgress, timeFromInput, ymd } from "../lib/calendar";
import { codeFromInput, shown, title } from "../lib/catalog";
import { CourseAutocomplete } from "./CourseAutocomplete";
import { DateAutocomplete } from "./DateAutocomplete";
import { TimeAutocomplete } from "./TimeAutocomplete";

function newId(): string {
  return Math.random().toString(36).slice(2, 9);
}

export function CalendarTab({
  state,
  setState,
}: {
  state: TrackerState;
  setState: (updater: (prev: TrackerState) => TrackerState) => void;
}) {
  const today = useMemo(() => new Date(), []);
  const tds = ymd(today);
  const [month, setMonth] = useState<[number, number]>([today.getFullYear(), today.getMonth()]);
  const [sel, setSel] = useState<string | null>(null);
  const [, setTick] = useState(0);

  // Recomputed every render (cheap) — the 1s interval below just forces a render so the
  // countdown display stays live; it doesn't need its own state for nu/tp.
  const nu = nextUp(state);
  const tp = termProgress();
  const nextAt = nu?.at.getTime();

  useEffect(() => {
    if (!nextAt) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [nextAt]);

  const [Y, M] = month;
  const first = new Date(Y, M, 1);
  const start = new Date(Y, M, 1 - first.getDay());
  const selDate = sel ?? tds;
  const sits = itemsOn(selDate, state);

  const days: { d: Date; ds: string }[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    if (i >= 35 && d.getMonth() !== M) break;
    days.push({ d, ds: ymd(d) });
  }

  const delClass = (id: string) =>
    setState((prev) => ({ ...prev, classes: prev.classes.filter((c) => c.id !== id) }));
  const delEvent = (id: string) =>
    setState((prev) => ({ ...prev, events: prev.events.filter((e) => e.id !== id) }));

  return (
    <>
      <div className="cal-top">
        <div className="next">
          <span className="eyebrow">Next up</span>
          {nu ? (
            <>
              <div className="what">{nu.it.text}</div>
              <div className="count-down">{countdown(nu.at)}</div>
              <div className="when">
                {DOW[nu.at.getDay()]} {nu.at.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                {nu.it.time ? ` · ${fmtTime(nu.it.time)}` : ""}
                {nu.it.sub ? ` · ${nu.it.sub}` : ""}
              </div>
            </>
          ) : (
            <>
              <div className="what">Nothing coming up</div>
              <div className="when">Add your class times below to see a live countdown.</div>
            </>
          )}
        </div>
        <div className="termcard">
          <span className="eyebrow">{tp.t.name}</span>
          <div style={{ fontWeight: 700, fontSize: 17 }}>{tp.label}</div>
          <div className="track">
            <div style={{ width: `${tp.pct}%`, background: "var(--accent)" }} />
          </div>
          <div className="muted" style={{ fontSize: 13 }}>
            {parseD(tp.t.start).toLocaleDateString(undefined, { month: "short", day: "numeric" })} –{" "}
            {parseD(tp.t.end).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })} ·
            exams follow
          </div>
        </div>
      </div>

      <div className="month">
        <div className="month-h">
          <h3>{first.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</h3>
          <button
            className="iconbtn"
            aria-label="Previous month"
            onClick={() => setMonth(([y, m]) => (m === 0 ? [y - 1, 11] : [y, m - 1]))}
          >
            ‹
          </button>
          <button
            className="iconbtn"
            onClick={() => {
              setMonth([today.getFullYear(), today.getMonth()]);
              setSel(tds);
            }}
          >
            Today
          </button>
          <button
            className="iconbtn"
            aria-label="Next month"
            onClick={() => setMonth(([y, m]) => (m === 11 ? [y + 1, 0] : [y, m + 1]))}
          >
            ›
          </button>
        </div>
        <div className="grid7">
          {DOW.map((d) => (
            <div className="dow" key={d}>
              {d}
            </div>
          ))}
          {days.map(({ d, ds }) => {
            const its = itemsOn(ds, state);
            const cls = ["day", d.getMonth() !== M ? "out" : "", ds === tds ? "today" : "", sel === ds ? "sel" : ""]
              .filter(Boolean)
              .join(" ");
            return (
              <button
                key={ds}
                className={cls}
                onClick={() => setSel(ds)}
                aria-label={`${d.toDateString()}, ${its.length} items`}
              >
                <span className="dn">{d.getDate()}</span>
                {its.slice(0, 3).map((x, i) => (
                  <span className={`ev ${x.kind}`} key={i}>
                    {x.time ? fmtTime(x.time).replace(":00", "") + " " : ""}
                    {x.text}
                  </span>
                ))}
                {its.length > 3 && <span className="more">+{its.length - 3} more</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="daypanel">
        <h3>{parseD(selDate).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</h3>
        {sits.length ? (
          <div className="ag">
            {sits.map((x, i) => (
              <div className="ag-i" key={i}>
                <span className="t">{x.time ? fmtTime(x.time) + (x.end ? "–" + fmtTime(x.end) : "") : "All day"}</span>
                <span>
                  {x.text}
                  {x.sub && (
                    <small className="muted" style={{ display: "block", fontSize: 12.5 }}>
                      {x.sub}
                    </small>
                  )}
                </span>
                <span className={`ev ${x.kind}`} style={{ fontSize: 11 }}>
                  {{ cls: "Class", mine: "Mine", holiday: "No classes", exam: "Exams", deadline: "Deadline", term: "Tyndale" }[
                    x.kind
                  ]}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted" style={{ margin: 0, fontSize: 14 }}>
            Nothing on this day.
          </p>
        )}
      </div>

      <div className="two">
        <ClassPanel
          classes={state.classes}
          onAdd={(c) => {
            setState((prev) => ({
              ...prev,
              classes: [...prev.classes, c],
              status: prev.status[c.code] ? prev.status : { ...prev.status, [c.code]: "i" },
            }));
          }}
          onDelete={delClass}
        />
        <EventPanel
          key={selDate}
          selDate={selDate}
          events={state.events}
          onAdd={(e) => {
            setState((prev) => ({ ...prev, events: [...prev.events, e] }));
            setSel(e.date);
          }}
          onDelete={delEvent}
        />
      </div>
    </>
  );
}

function ClassPanel({
  classes,
  onAdd,
  onDelete,
}: {
  classes: ClassEntry[];
  onAdd: (c: ClassEntry) => void;
  onDelete: (id: string) => void;
}) {
  const [code, setCode] = useState("");
  const [days, setDays] = useState<number[]>([]);
  const [start, setStart] = useState(fmtTime("10:00"));
  const [end, setEnd] = useState(fmtTime("11:20"));
  const [term, setTerm] = useState(TERMS[0]?.id ?? "");
  const [room, setRoom] = useState("");
  const [err, setErr] = useState("");

  const toggleDay = (d: number) => setDays((ds) => (ds.includes(d) ? ds.filter((x) => x !== d) : [...ds, d]));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const resolved = codeFromInput(code);
    if (!resolved) {
      setErr("Pick a course from the list, e.g. MEDA 113.");
      return;
    }
    if (!days.length) {
      setErr("Choose at least one day.");
      return;
    }
    const rStart = timeFromInput(start);
    const rEnd = timeFromInput(end);
    if (!rStart || !rEnd) {
      setErr("Pick a start and end time from the list, e.g. 10:30 am.");
      return;
    }
    if (rEnd <= rStart) {
      setErr("End time must be after the start time.");
      return;
    }
    setErr("");
    onAdd({ id: newId(), code: resolved, days, start: rStart, end: rEnd, term, room: room.trim().slice(0, 30) });
    setCode("");
    setDays([]);
    setRoom("");
  };

  return (
    <div className="panel">
      <h3>My class times</h3>
      <p className="muted" style={{ margin: 0, fontSize: 13 }}>
        Classes repeat weekly through the term and skip Tyndale holidays and reading days.
      </p>
      <div>
        {classes.length ? (
          classes.map((c) => (
            <div className="li" key={c.id}>
              <span>
                <b className="mono">{shown(c.code)}</b> {c.days.map((d) => DOW[d]).join(", ")} · {fmtTime(c.start)}–
                {fmtTime(c.end)}
                <small>
                  {title(c.code)} · {TERMS.find((t) => t.id === c.term)?.name ?? ""}
                  {c.room ? ` · ${c.room}` : ""}
                </small>
              </span>
              <button className="x" aria-label="Remove class" onClick={() => onDelete(c.id)}>
                ×
              </button>
            </div>
          ))
        ) : (
          <p className="faint" style={{ margin: 0, fontSize: 13 }}>
            No classes yet.
          </p>
        )}
      </div>
      <form className="form" onSubmit={submit}>
        <label className="full">
          Course
          <CourseAutocomplete
            className="field"
            placeholder="e.g. MEDA 113"
            required
            value={code}
            onChange={setCode}
            onPick={setCode}
          />
        </label>
        <div className="full days" role="group" aria-label="Days">
          {[1, 2, 3, 4, 5].map((d) => (
            <label key={d}>
              <input type="checkbox" checked={days.includes(d)} onChange={() => toggleDay(d)} />
              <span>{DOW[d]}</span>
            </label>
          ))}
        </div>
        <label>
          Starts
          <TimeAutocomplete className="field" required value={start} onChange={setStart} onPick={() => {}} />
        </label>
        <label>
          Ends
          <TimeAutocomplete className="field" required value={end} onChange={setEnd} onPick={() => {}} />
        </label>
        <label>
          Term
          <select className="field" value={term} onChange={(e) => setTerm(e.target.value)}>
            {TERMS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Room (optional)
          <input className="field" placeholder="e.g. A104" value={room} onChange={(e) => setRoom(e.target.value)} />
        </label>
        {err && <span className="err full">{err}</span>}
        <div className="full">
          <button className="btn" type="submit">
            Add class
          </button>
        </div>
      </form>
    </div>
  );
}

function EventPanel({
  selDate,
  events,
  onAdd,
  onDelete,
}: {
  selDate: string;
  events: EventEntry[];
  onAdd: (e: EventEntry) => void;
  onDelete: (id: string) => void;
}) {
  const [titleVal, setTitleVal] = useState("");
  const [date, setDate] = useState(fmtDate(selDate));
  const [time, setTime] = useState("");
  const [err, setErr] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = titleVal.trim();
    if (!t) return;
    const rDate = dateFromInput(date);
    if (!rDate) {
      setErr("Pick a date from the calendar, or type one like Oct 15, 2026.");
      return;
    }
    const rTime = time.trim() ? timeFromInput(time) : "";
    if (rTime === null) {
      setErr("Pick a time from the list, e.g. 10:30 am, or leave it blank.");
      return;
    }
    setErr("");
    onAdd({ id: newId(), title: t.slice(0, 80), date: rDate, time: rTime });
    setTitleVal("");
    setTime("");
  };

  const sorted = events.slice().sort((a, b) => (a.date + (a.time || "")).localeCompare(b.date + (b.time || "")));

  return (
    <div className="panel">
      <h3>My dates</h3>
      <p className="muted" style={{ margin: 0, fontSize: 13 }}>
        Assignments, games, anything you want on the calendar.
      </p>
      <div>
        {sorted.length ? (
          sorted.map((e) => (
            <div className="li" key={e.id}>
              <span>
                {e.title}
                <small>
                  {parseD(e.date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                  {e.time ? ` · ${fmtTime(e.time)}` : ""}
                </small>
              </span>
              <button className="x" aria-label="Remove date" onClick={() => onDelete(e.id)}>
                ×
              </button>
            </div>
          ))
        ) : (
          <p className="faint" style={{ margin: 0, fontSize: 13 }}>
            No dates yet.
          </p>
        )}
      </div>
      <form className="form" onSubmit={submit}>
        <label className="full">
          What
          <input
            className="field"
            placeholder="e.g. BSTH 102 essay due"
            required
            value={titleVal}
            onChange={(e) => setTitleVal(e.target.value)}
          />
        </label>
        <label>
          Date
          <DateAutocomplete className="field" required value={date} onChange={setDate} onPick={() => {}} />
        </label>
        <label>
          Time (optional)
          <TimeAutocomplete
            className="field"
            placeholder="No specific time"
            value={time}
            onChange={setTime}
            onPick={() => {}}
          />
        </label>
        {err && <span className="err full">{err}</span>}
        <div className="full">
          <button className="btn" type="submit">
            Add date
          </button>
        </div>
      </form>
    </div>
  );
}
