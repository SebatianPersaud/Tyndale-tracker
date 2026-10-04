import { shown, title } from "../lib/catalog";

export function Chip({ code, onClick }: { code: string; onClick: () => void }) {
  return (
    <button className="chip" onClick={onClick} title={title(code)}>
      {shown(code)}
      <em>{title(code)}</em>
    </button>
  );
}
