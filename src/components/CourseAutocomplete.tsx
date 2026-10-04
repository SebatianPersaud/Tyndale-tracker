import { useEffect, useRef, useState } from "react";
import { CATALOG } from "../data/2026-27/catalog";
import { shown } from "../lib/catalog";

const MAX_SUGGESTIONS = 8;

/**
 * A "type a course" text input with a custom suggestion dropdown, standing in for the
 * native <input list="..."> datalist. Native datalist popups are positioned by the browser
 * itself and are unreliable once the input sits inside flex/sticky layouts (they can show up
 * anywhere on the page, notably in Safari) — this version is a normal positioned <div> we
 * fully control, so it always opens directly under the field.
 */
export function CourseAutocomplete({
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
  onPick: (code: string) => void;
  required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  const query = value.trim().toLowerCase();
  const matches = query
    ? CATALOG.filter(
        ([c, t]) => shown(c).toLowerCase().includes(query) || t.toLowerCase().includes(query),
      ).slice(0, MAX_SUGGESTIONS)
    : [];

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const pick = (code: string, label: string) => {
    onChange(label);
    onPick(code);
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
        onFocus={() => setOpen(true)}
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
            const [c, t] = matches[highlight];
            pick(c, `${shown(c)} — ${t}`);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
      />
      {open && matches.length > 0 && (
        <ul className="autocomplete-list" role="listbox">
          {matches.map(([c, t], i) => (
            <li key={c}>
              <button
                type="button"
                className={i === highlight ? "hl" : ""}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(c, `${shown(c)} — ${t}`)}
              >
                <span className="code mono">{shown(c)}</span> <span className="muted">{t}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
