import { useEffect, useRef, useState } from "react";
import { TIME_OPTIONS, fmtTime } from "../lib/calendar";

const MAX_SUGGESTIONS = 8;

/**
 * A "type a time" text input with a custom suggestion dropdown on a 5-minute grid — same
 * pattern as CourseAutocomplete, so typing and picking feel the same everywhere in the app.
 * Matches are prefix-based on the digits/letters only, so "1030a", "10:30 am", and "1030"
 * (am and pm both, until narrowed) all find "10:30 am".
 */
export function TimeAutocomplete({
  className,
  placeholder,
  ariaLabel,
  value,
  onChange,
  onPick,
  required,
}: {
  className?: string;
  placeholder?: string;
  ariaLabel?: string;
  value: string;
  onChange: (value: string) => void;
  onPick: (hhmm: string) => void;
  required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  const query = value.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  const matches = query
    ? TIME_OPTIONS.filter((t) => fmtTime(t).toLowerCase().replace(/[^a-z0-9]/g, "").startsWith(query)).slice(
        0,
        MAX_SUGGESTIONS,
      )
    : [];

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const pick = (t: string) => {
    onChange(fmtTime(t));
    onPick(t);
    setOpen(false);
  };

  return (
    <div className="autocomplete" ref={wrapRef}>
      <input
        className={className}
        placeholder={placeholder}
        aria-label={ariaLabel}
        autoComplete="off"
        required={required}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setHighlight(0);
        }}
        onFocus={(e) => {
          setOpen(true);
          e.target.select();
        }}
        onKeyDown={(e) => {
          if (!open || !matches.length) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlight((h) => Math.min(h + 1, matches.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlight((h) => Math.max(h - 1, 0));
          } else if (e.key === "Enter" && matches[highlight]) {
            e.preventDefault();
            pick(matches[highlight]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
      />
      {open && matches.length > 0 && (
        <ul className="autocomplete-list" role="listbox">
          {matches.map((t, i) => (
            <li key={t}>
              <button
                type="button"
                className={i === highlight ? "hl" : ""}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(t)}
              >
                {fmtTime(t)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
