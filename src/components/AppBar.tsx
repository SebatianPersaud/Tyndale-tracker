import type { SyncStatus } from "../hooks/useTrackerState";

const TABS = [
  { id: "degree", label: "Degree" },
  { id: "cal", label: "Calendar" },
  { id: "courses", label: "Courses" },
] as const;

export type TabId = (typeof TABS)[number]["id"];

export function AppBar({
  who,
  tab,
  onTabChange,
  sync,
  signedIn,
  onOpenSettings,
}: {
  who: string;
  tab: TabId;
  onTabChange: (tab: TabId) => void;
  sync: SyncStatus;
  signedIn: boolean;
  onOpenSettings: () => void;
}) {
  const syncText =
    sync === "saving"
      ? "Saving…"
      : sync === "local"
        ? "Couldn't reach your account — saved on this device"
        : signedIn
          ? "Saved to your account"
          : "Saved on this device";
  return (
    <header className="bar">
      <div className="bar-in">
        <div className="brand">
          <b>Degree Tracker</b>
          <span>{who}</span>
        </div>
        <nav className="tabs" role="tablist" aria-label="Pages">
          {TABS.map((t) => (
            <button
              key={t.id}
              className="tab"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => onTabChange(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <span className="sync" data-s={sync}>
          <i />
          <span>{syncText}</span>
        </span>
        <button className="iconbtn" onClick={onOpenSettings}>
          Settings
        </button>
      </div>
    </header>
  );
}
