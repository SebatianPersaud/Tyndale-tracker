import { useEffect, useRef, useState } from "react";
import { DOW, dateFromInput, fmtDate, ymd } from "../lib/calendar";

/**
 * A "type a date" text input with a compact calendar-grid popover — same open/pick/outside-
 * click pattern as CourseAutocomplete and TimeAutocomplete, so every "type or pick" field in
 * the app behaves the same way. Typing accepts anything the browser's own date parser
 * understands (native feature, not a hand-rolled parser); clicking a day in the grid is the
 * fast path.
 */
export function DateAutocomplete({
  className,
  value,
  onChange,
  onPick,
  required,
}: {
  className?: string;
  value: string;
  onChange: (value: string) => void;
  onPick: (ymd: string) => void;
  required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<[number, number]>(() => {
    const parsed = dateFromInput(value);
    const d = parsed ? new Date(parsed) : new Date();
    return [d.getFullYear(), d.getMonth()];
  });
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const pick = (ds: string) => {
    onChange(fmtDate(ds));
    onPick(ds);
    setOpen(false);
  };

  const [Y, M] = view;
  const first = new Date(Y, M, 1);
  const gridStart = new Date(Y, M, 1 - first.getDay());
  const days = Array.from({ length: 42 }, (_, i) => new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i));
  const selected = dateFromInput(value);
  const today = ymd(new Date());

  return (
    <div className="autocomplete" ref={wrapRef}>
      <input
        className={className}
        placeholder="Pick a date"
        autoComplete="off"
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
      />
      {open && (
        <div className="datepop">
          <div className="datepop-h">
            <button type="button" className="iconbtn" aria-label="Previous month" onClick={() => setView(([y, m]) => (m === 0 ? [y - 1, 11] : [y, m - 1]))}>
              ‹
            </button>
            <b>{first.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</b>
            <button type="button" className="iconbtn" aria-label="Next month" onClick={() => setView(([y, m]) => (m === 11 ? [y + 1, 0] : [y, m + 1]))}>
              ›
            </button>
          </div>
          <div className="datepop-grid">
            {DOW.map((d) => (
              <span className="datepop-dow" key={d}>
                {d[0]}
              </span>
            ))}
            {days.map((d) => {
              const ds = ymd(d);
              const cls = ["datepop-day", d.getMonth() !== M ? "out" : "", ds === today ? "today" : "", ds === selected ? "sel" : ""]
                .filter(Boolean)
                .join(" ");
              return (
                <button type="button" key={ds} className={cls} onClick={() => pick(ds)}>
                  {d.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
