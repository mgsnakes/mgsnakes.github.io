/** Emblème de dragon stylisé (clin d'œil au logo GW2), tracé en SVG.
 *  Aile déployée + halo pulsant. Couleurs pilotées par le thème. */
export default function DragonGlyph({ size = 96 }) {
  return (
    <svg width={size} height={size * 0.62} viewBox="0 0 200 124" fill="none" role="img" aria-label="Emblème de Tyrie">
      <defs>
        <radialGradient id="halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--gold-bright)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="wing" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--gold-bright)" />
          <stop offset="100%" stopColor="var(--red)" />
        </linearGradient>
      </defs>

      {/* halo pulsant */}
      <circle cx="100" cy="64" r="58" fill="url(#halo)" style={{ animation: "pulseGlow 4s ease-in-out infinite" }} />

      {/* corps central / tête de dragon stylisée */}
      <path
        d="M100 16 L108 40 L100 52 L92 40 Z"
        fill="url(#wing)" stroke="var(--gold)" strokeWidth="1.5"
      />
      {/* ailes symétriques en chevrons */}
      <g stroke="url(#wing)" strokeWidth="3" strokeLinecap="round" fill="none">
        <path d="M96 56 C70 50 48 56 24 78 C44 70 60 72 74 80 C58 78 46 84 34 98 C56 86 78 84 96 92" />
        <path d="M104 56 C130 50 152 56 176 78 C156 70 140 72 126 80 C142 78 154 84 166 98 C144 86 122 84 104 92" />
      </g>
      {/* griffe centrale */}
      <path d="M100 60 L100 104 M100 104 L92 96 M100 104 L108 96"
        stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}
