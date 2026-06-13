/** Logotype maison « GUILD WARS » en capitales gravées + sous-titre.
 *  Recréé en SVG, sans utiliser le glyphe/police propriétaire d'ArenaNet. */
export default function Logotype({ height = 34 }) {
  return (
    <svg height={height} viewBox="0 0 240 56" fill="none" role="img" aria-label="Forge des Noms — Tyrie"
      style={{ display: "block" }}>
      <defs>
        <linearGradient id="lg-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--gold-bright)" />
          <stop offset="100%" stopColor="var(--gold)" />
        </linearGradient>
      </defs>
      {/* petit emblème losange à gauche */}
      <g transform="translate(20 28)">
        <path d="M0 -16 L11 0 L0 16 L-11 0 Z" fill="none" stroke="var(--gold)" strokeWidth="1.5" />
        <path d="M0 -8 L0 8 M-7 0 L7 0" stroke="var(--gold)" strokeWidth="1.5" />
        <circle cx="0" cy="0" r="2.4" fill="var(--gold-bright)" />
      </g>
      {/* texte */}
      <text x="44" y="26" fontFamily="'Cinzel Decorative','Cinzel',serif" fontWeight="900"
        fontSize="20" letterSpacing="2" fill="url(#lg-gold)">FORGE</text>
      <text x="44" y="46" fontFamily="'Cinzel','Trajan Pro',serif" fontWeight="700"
        fontSize="13" letterSpacing="5" fill="var(--ink-soft)">DES NOMS</text>
    </svg>
  );
}
