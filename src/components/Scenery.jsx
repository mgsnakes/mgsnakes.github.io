/** Paysages de Tyrie en SVG : générés, libres de droits, zéro asset externe.
 *  Chaque variante évoque une région (montagnes, forêt, cité, désert).
 *  Couleurs pilotées par la prop `tint`. */

function Layer({ d, fill, opacity = 1 }) {
  return <path d={d} fill={fill} opacity={opacity} />;
}

export default function Scenery({ variant = "peaks", tint = "#b03622", height = 280 }) {
  // Palettes par variante
  const skies = {
    peaks: ["#2a1410", "#3a1d14"],
    forest: ["#10231a", "#16301f"],
    city: ["#241018", "#341a22"],
    desert: ["#2e1f10", "#3e2a14"],
  };
  const [sky1, sky2] = skies[variant] || skies.peaks;

  return (
    <svg viewBox="0 0 1200 400" width="100%" height={height} preserveAspectRatio="xMidYMid slice"
      style={{ display: "block" }} aria-hidden="true">
      <defs>
        <linearGradient id={`sky-${variant}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={sky1} />
          <stop offset="100%" stopColor={sky2} />
        </linearGradient>
        <radialGradient id={`sun-${variant}`} cx="50%" cy="38%" r="34%">
          <stop offset="0%" stopColor={tint} stopOpacity="0.85" />
          <stop offset="55%" stopColor={tint} stopOpacity="0.18" />
          <stop offset="100%" stopColor={tint} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`fade-${variant}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0c0908" stopOpacity="0" />
          <stop offset="100%" stopColor="#0c0908" stopOpacity="0.95" />
        </linearGradient>
      </defs>

      {/* ciel */}
      <rect width="1200" height="400" fill={`url(#sky-${variant})`} />
      {/* halo / soleil de Tyrie */}
      <circle cx="600" cy="150" r="220" fill={`url(#sun-${variant})`} />
      <circle cx="600" cy="150" r="34" fill={tint} opacity="0.5" />

      {/* étoiles discrètes */}
      {Array.from({ length: 30 }).map((_, i) => (
        <circle key={i} cx={(i * 53) % 1200} cy={(i * 29) % 130} r={i % 3 === 0 ? 1.4 : 0.8}
          fill="#f2e6d0" opacity={0.12 + (i % 4) * 0.04} />
      ))}

      {/* couches de relief selon la variante */}
      {variant === "forest" ? (
        <>
          <Layer d="M0 400 L0 250 Q150 200 300 240 T600 230 T900 250 T1200 230 L1200 400 Z" fill="#0e2018" opacity="0.9" />
          {/* sapins */}
          {Array.from({ length: 20 }).map((_, i) => {
            const x = 30 + i * 60, h = 60 + (i % 5) * 18, y = 300 - (i % 3) * 12;
            return <path key={i} d={`M${x} ${y} l18 ${h} h-36 Z`} fill="#0a1812" opacity="0.85" />;
          })}
        </>
      ) : variant === "city" ? (
        <>
          <Layer d="M0 400 L0 300 L1200 300 L1200 400 Z" fill="#1a0e12" />
          {/* silhouettes de tours */}
          {Array.from({ length: 14 }).map((_, i) => {
            const x = i * 90, w = 50, h = 90 + (i % 4) * 45;
            return <rect key={i} x={x} y={300 - h} width={w} height={h} fill="#120a0e" opacity="0.9" />;
          })}
          {/* lueurs de fenêtres */}
          {Array.from({ length: 26 }).map((_, i) => (
            <rect key={i} x={(i * 47) % 1180 + 8} y={210 + (i % 5) * 16} width="4" height="4" fill={tint} opacity="0.5" />
          ))}
        </>
      ) : variant === "desert" ? (
        <>
          <Layer d="M0 400 L0 320 Q300 280 600 320 T1200 320 L1200 400 Z" fill="#241808" opacity="0.9" />
          <Layer d="M0 400 L0 350 Q400 320 800 350 T1200 350 L1200 400 Z" fill="#1a1206" />
        </>
      ) : (
        <>
          {/* peaks : montagnes enneigées */}
          <Layer d="M0 400 L180 200 L320 320 L470 150 L640 330 L780 210 L960 300 L1100 180 L1200 280 L1200 400 Z" fill="#1c1414" opacity="0.85" />
          <Layer d="M0 400 L120 280 L260 360 L420 240 L600 380 L760 280 L920 360 L1080 260 L1200 340 L1200 400 Z" fill="#120c0c" />
          {/* neige sur les sommets */}
          <path d="M470 150 l28 40 -56 0 Z M1100 180 l24 34 -48 0 Z M180 200 l22 30 -44 0 Z" fill="#e8dfc4" opacity="0.18" />
        </>
      )}

      {/* brume + fondu bas */}
      <rect y="240" width="1200" height="160" fill={`url(#fade-${variant})`} />
    </svg>
  );
}
