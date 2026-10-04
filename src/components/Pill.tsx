import { STATUS_LABEL, type Status } from "../types";
import { shown } from "../lib/catalog";

export function Pill({ code, status, onCycle }: { code: string; status: Status; onCycle: (code: string) => void }) {
  return (
    <button
      className="pill"
      data-s={status}
      onClick={() => onCycle(code)}
      aria-label={`${shown(code)}: ${STATUS_LABEL[status]}. Change status`}
    >
      {STATUS_LABEL[status]}
    </button>
  );
}
