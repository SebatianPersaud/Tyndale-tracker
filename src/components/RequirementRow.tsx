import { useState } from "react";
import type { Row } from "../data/2026-27/types";
import type { TrackerState } from "../types";
import { effChoice, rowCodes, rowTarget, type Computed } from "../lib/requirements";
import { suggestCode } from "../lib/catalog";
import { CourseLine } from "./CourseLine";
import { Chip } from "./Chip";
import { CourseAutocomplete } from "./CourseAutocomplete";

export function RequirementRow({
  row,
  rowKey,
  state,
  computed,
  onCycle,
  onChoose,
  onUnchoose,
  onAddElective,
  showAll,
  onToggleShowAll,
}: {
  row: Row;
  rowKey: string;
  state: TrackerState;
  computed: Computed;
  onCycle: (code: string) => void;
  onChoose: (key: string, code: string) => void;
  onUnchoose: (key: string, code: string) => void;
  onAddElective: (code: string) => void;
  showAll: boolean;
  onToggleShowAll: () => void;
}) {
  if (typeof row === "string") {
    return (
      <div className="row">
        <CourseLine code={row} status={state.status[row] ?? ""} onCycle={onCycle} />
      </div>
    );
  }

  if ("free" in row) {
    const fill = computed.freeFill[rowKey] ?? 0;
    const list = computed.leftoverAny;
    return (
      <div className="row">
        <div className="freebar">
          <div className="mini" style={{ width: 120 }}>
            <div style={{ width: `${Math.round((fill / row.free) * 100)}%` }} />
          </div>
          <span>
            <b style={{ color: "var(--fg)" }}>{fill}</b> of {row.free} cr. Filled automatically by courses you mark
            that don't count elsewhere.
          </span>
        </div>
        {list.map((c) => (
          <CourseLine key={c} code={c} status={state.status[c] ?? ""} onCycle={onCycle} />
        ))}
        <SlotInput
          placeholder="Add a course, e.g. PSYC 101"
          ariaLabel="Add a course to your electives"
          onPick={onAddElective}
        />
      </div>
    );
  }

  const chosen = effChoice(row, rowKey, state);

  if ("el" in row) {
    const slots = Math.max(1, Math.ceil(row.cr / 3));
    const empty = Math.max(0, slots - chosen.length);
    return (
      <div className="row">
        <div className="row-label">
          {row.el} <span className="count">· {row.cr} cr</span>
          {row.hint && <span className="faint">· {row.hint}</span>}
        </div>
        {chosen.map((c) => (
          <CourseLine
            key={c}
            code={c}
            status={state.status[c] ?? ""}
            onCycle={onCycle}
            onRemove={() => onUnchoose(rowKey, c)}
          />
        ))}
        {Array.from({ length: empty }).map((_, i) => (
          <SlotInput
            key={i}
            placeholder={`Add a course, e.g. ${suggestCode(row.el, row.hint)}`}
            ariaLabel={`Add a course for ${row.el}`}
            onPick={(code) => onChoose(rowKey, code)}
          />
        ))}
      </div>
    );
  }

  const isPick = "pick" in row;
  const label = row.label ?? (isPick ? `Choose ${row.pick === 1 ? "one" : row.pick}` : "Choose from");
  const full = isPick && chosen.length >= row.pick;
  const show = !full || showAll;
  const subject = (code: string) => code.split(" ")[0];
  let opts = rowCodes(row).filter((c) => !chosen.includes(c));
  // Once a one-track row (e.g. "Greek or Hebrew") has a pick, stop offering the other subject —
  // picking into both isn't a real option, so there's nothing to show "Change" into either.
  if ("oneTrack" in row && row.oneTrack && chosen.length > 0) {
    opts = opts.filter((c) => subject(c) === subject(chosen[0]));
  }

  return (
    <div className="row">
      <div className="row-label">
        {label}{" "}
        <span className="count">
          {isPick ? `${chosen.length} of ${row.pick} chosen` : rowTarget(row) ? `${rowTarget(row)} cr` : "counts toward block"}
        </span>
        {full && (
          <button className="linkbtn" onClick={onToggleShowAll}>
            {showAll ? "Hide options" : "Change"}
          </button>
        )}
      </div>
      {chosen.map((c) => (
        <CourseLine
          key={c}
          code={c}
          status={state.status[c] ?? ""}
          onCycle={onCycle}
          onRemove={(state.choice[rowKey] ?? []).includes(c) ? () => onUnchoose(rowKey, c) : undefined}
        />
      ))}
      {show && opts.length > 0 && (
        <div className="chips">
          {opts.map((c) => (
            <Chip key={c} code={c} onClick={() => onChoose(rowKey, c)} />
          ))}
        </div>
      )}
    </div>
  );
}

function SlotInput({
  placeholder,
  ariaLabel,
  onPick,
}: {
  placeholder: string;
  ariaLabel: string;
  onPick: (code: string) => void;
}) {
  const [value, setValue] = useState("");
  return (
    <div className="slot">
      <CourseAutocomplete
        placeholder={placeholder}
        ariaLabel={ariaLabel}
        value={value}
        onChange={setValue}
        onPick={(code) => {
          onPick(code);
          setValue("");
        }}
      />
    </div>
  );
}
