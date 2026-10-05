import type { TrackerState } from "../types";
import { blockDone, rowKey, rowTarget, type Computed, type ResolvedBlock, type ResolvedSection } from "../lib/requirements";
import { RequirementRow } from "./RequirementRow";

export function RequirementBlock({
  section,
  block,
  blockIndex,
  state,
  computed,
  onCycle,
  onChoose,
  onUnchoose,
  onAddElective,
  showAll,
  onToggleShowAll,
}: {
  section: ResolvedSection;
  block: ResolvedBlock;
  blockIndex: number;
  state: TrackerState;
  computed: Computed;
  onCycle: (code: string) => void;
  onChoose: (key: string, code: string) => void;
  onUnchoose: (key: string, code: string) => void;
  onAddElective: (code: string) => void;
  showAll: Record<string, boolean>;
  onToggleShowAll: (key: string) => void;
}) {
  const done = blockDone(section, block, blockIndex, computed, state);
  const sumTarget = block.rows.reduce((a, r) => a + rowTarget(r), 0);
  return (
    <div className="block">
      <div className="block-h">
        <h3>{block.t}</h3>
        <span className="cr">
          {done} / {block.cr} cr
        </span>
        <div className="mini">
          <div style={{ width: `${Math.round((done / block.cr) * 100)}%` }} />
        </div>
      </div>
      <div className="rows">
        {block.rows.map((r, ri) => {
          const k = rowKey(section.key, blockIndex, ri);
          return (
            <RequirementRow
              key={k}
              row={r}
              rowKey={k}
              state={state}
              computed={computed}
              onCycle={onCycle}
              onChoose={onChoose}
              onUnchoose={onUnchoose}
              onAddElective={onAddElective}
              showAll={!!showAll[k]}
              onToggleShowAll={() => onToggleShowAll(k)}
            />
          );
        })}
        {sumTarget > 0 && sumTarget < block.cr && (
          <div className="row">
            <span className="faint" style={{ fontSize: 13 }}>
              {block.cr - sumTarget} more credit hours in this block are listed on the official sheet; check it for
              the exact courses.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
