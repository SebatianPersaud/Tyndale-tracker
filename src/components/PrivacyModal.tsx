export function PrivacyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="scrim" role="dialog" aria-modal="true" aria-labelledby="ph" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2 id="ph">Privacy</h2>
        <p>
          This is a free, unofficial tool built by a Tyndale student. It isn't run by Tyndale University, and
          nobody but you sees your data.
        </p>
        <p>
          <b style={{ color: "var(--fg)" }}>What's stored:</b> your email address (for signing in), an optional
          first name, and your tracker itself — the program/minor/concentration you picked, the status of each
          course (planned/in progress/done), your class times, and any personal dates you add. That's it: no
          student number, no grades, no GPA.
        </p>
        <p>
          <b style={{ color: "var(--fg)" }}>Who can see it:</b> only you. Your tracker is stored in a database
          row tied to your account, protected so that even with direct database access, nobody — including other
          signed-in students — can read or change a row that isn't theirs.
        </p>
        <p>
          <b style={{ color: "var(--fg)" }}>How to delete it:</b> Settings → "Delete my account and data"
          permanently removes your account and everything in it, right away. If you'd rather just keep your
          account but clear your tracker, use "Start over…" in Settings instead.
        </p>
        <div className="actions">
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
