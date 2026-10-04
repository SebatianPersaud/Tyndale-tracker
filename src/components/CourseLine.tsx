import type { Status } from "../types";
import { cr, shown, title } from "../lib/catalog";
import { Pill } from "./Pill";

export function CourseLine({
  code,
  status,
  onCycle,
  onRemove,
}: {
  code: string;
  status: Status;
  onCycle: (code: string) => void;
  onRemove?: () => void;
}) {
  return (
    <div className="course">
      <Pill code={code} status={status} onCycle={onCycle} />
      <div className="ct">
        <span className="code">{shown(code)}</span> <span className="title">{title(code)}</span>
      </div>
      <span className="crs">
        {cr(code)} cr
        {onRemove && (
          <button className="x" title="Remove" aria-label={`Remove ${shown(code)}`} onClick={onRemove}>
            ×
          </button>
        )}
      </span>
    </div>
  );
}
