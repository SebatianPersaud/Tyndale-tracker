export function ImportPrompt({
  open,
  busy,
  onImport,
  onFresh,
}: {
  open: boolean;
  busy: boolean;
  onImport: () => void;
  onFresh: () => void;
}) {
  if (!open) return null;
  return (
    <div className="scrim" role="dialog" aria-modal="true" aria-labelledby="ih">
      <div className="modal">
        <h2 id="ih">Bring in your tracker?</h2>
        <p>We found a tracker already saved on this device, from before you signed in. Bring it into your account?</p>
        <div className="actions">
          <button className="btn ghost" disabled={busy} onClick={onFresh}>
            Start fresh instead
          </button>
          <button className="btn" disabled={busy} onClick={onImport}>
            {busy ? "Importing…" : "Import it"}
          </button>
        </div>
      </div>
    </div>
  );
}
