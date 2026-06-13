/** Filet ornemental avec losange central (motif d'emblème). */
export default function Divider() {
  return (
    <div className="divider" aria-hidden="true">
      <span className="line" />
      <span className="lozenge">◆</span>
      <span className="line" />
    </div>
  );
}
