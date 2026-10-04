import { useEffect, useState } from "react";
import { useTrackerState } from "./hooks/useTrackerState";
import { PROG } from "./lib/requirements";
import { loadTab, saveTab } from "./lib/storage";
import { AppBar, type TabId } from "./components/AppBar";
import { DegreeTab } from "./components/DegreeTab";
import { CalendarTab } from "./components/CalendarTab";
import { CoursesTab } from "./components/CoursesTab";
import { SettingsModal } from "./components/SettingsModal";
import { Footer } from "./components/Footer";

export default function App() {
  const { state, setState, sync } = useTrackerState();
  const [tab, setTab] = useState<TabId>(() => (loadTab() as TabId) || "degree");
  const [openSettings, setOpenSettings] = useState(false);

  useEffect(() => saveTab(tab), [tab]);

  const p = PROG.get(state.program);
  const who = p ? `${state.name ? state.name + " · " : ""}${p.cred} ${p.name}` : "Tyndale University · 2026–27";
  const forced = !state.program;

  return (
    <>
      <AppBar who={who} tab={tab} onTabChange={setTab} sync={sync} onOpenSettings={() => setOpenSettings(true)} />
      <main className="wrap">
        {tab === "cal" ? (
          <CalendarTab state={state} setState={setState} />
        ) : tab === "courses" ? (
          <CoursesTab state={state} setState={setState} />
        ) : (
          <DegreeTab state={state} setState={setState} onOpenSettings={() => setOpenSettings(true)} />
        )}
        <Footer />
      </main>
      <SettingsModal
        open={openSettings || forced}
        forced={forced}
        state={state}
        setState={setState}
        onClose={() => setOpenSettings(false)}
      />
    </>
  );
}
