import { useEffect, useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { useTrackerState } from "./hooks/useTrackerState";
import { PROG } from "./lib/requirements";
import { loadTab, saveTab } from "./lib/storage";
import { AppBar, type TabId } from "./components/AppBar";
import { DegreeTab } from "./components/DegreeTab";
import { CalendarTab } from "./components/CalendarTab";
import { CoursesTab } from "./components/CoursesTab";
import { SettingsModal } from "./components/SettingsModal";
import { PrivacyModal } from "./components/PrivacyModal";
import { ImportPrompt } from "./components/ImportPrompt";
import { Footer } from "./components/Footer";

export default function App() {
  const auth = useAuth();
  const { state, setState, sync, importPrompt, resolveImport, busy } = useTrackerState(auth.user);
  const [tab, setTab] = useState<TabId>(() => (loadTab() as TabId) || "degree");
  const [openSettings, setOpenSettings] = useState(false);
  const [openPrivacy, setOpenPrivacy] = useState(false);

  useEffect(() => saveTab(tab), [tab]);

  if (auth.loading) {
    return (
      <main className="wrap">
        <p className="skel">Loading your tracker…</p>
      </main>
    );
  }

  const p = PROG.get(state.program);
  const who = p ? `${state.name ? state.name + " · " : ""}${p.cred} ${p.name}` : "Tyndale University · 2026–27";
  const forced = !state.program && !importPrompt;
  // A password-reset email link lands back here with a recovery session — jump straight
  // to the account panel so they can set a new password.
  const settingsOpen = openSettings || forced || auth.passwordRecovery;

  return (
    <>
      <AppBar
        who={who}
        tab={tab}
        onTabChange={setTab}
        sync={sync}
        signedIn={!!auth.user}
        onOpenSettings={() => setOpenSettings(true)}
      />
      <main className="wrap">
        {tab === "cal" ? (
          <CalendarTab state={state} setState={setState} />
        ) : tab === "courses" ? (
          <CoursesTab state={state} setState={setState} />
        ) : (
          <DegreeTab state={state} setState={setState} onOpenSettings={() => setOpenSettings(true)} />
        )}
        <Footer onOpenPrivacy={() => setOpenPrivacy(true)} />
      </main>
      <SettingsModal
        open={settingsOpen}
        forced={forced}
        state={state}
        setState={setState}
        onClose={() => setOpenSettings(false)}
        auth={auth}
        onOpenPrivacy={() => setOpenPrivacy(true)}
      />
      <PrivacyModal open={openPrivacy} onClose={() => setOpenPrivacy(false)} />
      <ImportPrompt
        open={importPrompt}
        busy={busy}
        onImport={() => resolveImport("import")}
        onFresh={() => resolveImport("fresh")}
      />
    </>
  );
}
