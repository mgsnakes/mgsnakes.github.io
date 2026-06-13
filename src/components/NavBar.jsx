import { useChest } from "../context/ChestContext.jsx";

const TABS = [
  { id: "forge", label: "Forge", glyph: "✦" },
  { id: "warbands", label: "Warbands", glyph: "⚔" },
  { id: "guildes", label: "Guildes", glyph: "⚑" },
  { id: "peuples", label: "Peuples", glyph: "❧" },
];

export default function NavBar({ route, navigate }) {
  const { saved } = useChest();
  return (
    <nav className="navbar" aria-label="Navigation principale">
      <div className="nav-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`nav-tab${route === t.id ? " active" : ""}`}
            onClick={() => navigate(t.id)}
            aria-current={route === t.id ? "page" : undefined}
          >
            <span className="nav-glyph" aria-hidden>{t.glyph}</span>
            {t.label}
          </button>
        ))}
      </div>
      <button
        className={`nav-tab chest-tab${route === "coffre" ? " active" : ""}`}
        onClick={() => navigate("coffre")}
        aria-current={route === "coffre" ? "page" : undefined}
      >
        <span className="nav-glyph" aria-hidden>⚜</span>
        Coffre
        {saved.length > 0 && <span className="nav-badge">{saved.length}</span>}
      </button>
    </nav>
  );
}
