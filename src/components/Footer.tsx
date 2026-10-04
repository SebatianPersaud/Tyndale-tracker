export function Footer({ onOpenPrivacy }: { onOpenPrivacy: () => void }) {
  return (
    <footer>
      Unofficial student-made tool. Requirements come from Tyndale's 2026–27 program sheets and course list on
      tyndale.ca, and dates from the 2026–27 Arts &amp; Sciences academic calendar. Always confirm your plan with the
      Registrar or your faculty advisor. <a href="#" onClick={(e) => { e.preventDefault(); onOpenPrivacy(); }}>Privacy</a>
    </footer>
  );
}
