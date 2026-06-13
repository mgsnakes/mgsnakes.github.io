import { useState } from "react";
import Logotype from "./Logotype.jsx";
import ThemeToggle from "./ThemeToggle.jsx";
import { useChest } from "../context/ChestContext.jsx";

/* Navigation façon guildwars2.com : entrées en capitales, menus déroulants.
   Les liens internes pointent vers nos pages (générateurs). */
const MENU = [
  {
    id: "forge", label: "Forge",
    items: [
      { label: "Générateur de noms", route: "forge" },
      { label: "Warbands charr", route: "warbands" },
      { label: "Noms de guilde", route: "guildes" },
    ],
  },
  {
    id: "peuples", label: "Les Peuples",
    items: [
      { label: "Vue d'ensemble", route: "peuples" },
      { label: "Humains", route: "peuples" },
      { label: "Charrs", route: "peuples" },
      { label: "Norns", route: "peuples" },
      { label: "Asuras", route: "peuples" },
      { label: "Sylvaris", route: "peuples" },
    ],
  },
  { id: "coffre", label: "Coffre", items: [{ label: "Mes noms gardés", route: "coffre" }] },
];

export default function SiteHeader({ route, navigate }) {
  const [open, setOpen] = useState(null);
  const [mobile, setMobile] = useState(false);
  const { saved } = useChest();

  const go = (r) => { navigate(r); setOpen(null); setMobile(false); };

  return (
    <header className="site-header">
      <div className="sh-inner">
        <button className="sh-logo" onClick={() => go("forge")} aria-label="Accueil">
          <Logotype height={34} />
        </button>

        <nav className={`sh-nav${mobile ? " open" : ""}`} aria-label="Navigation">
          {MENU.map((m) => (
            <div
              key={m.id}
              className="sh-item"
              onMouseEnter={() => setOpen(m.id)}
              onMouseLeave={() => setOpen(null)}
            >
              <button
                className={`sh-link${m.items.some((i) => i.route === route) ? " active" : ""}`}
                onClick={() => (m.items.length === 1 ? go(m.items[0].route) : setOpen(open === m.id ? null : m.id))}
                aria-expanded={open === m.id}
              >
                {m.label}
                {m.id === "coffre" && saved.length > 0 && <span className="sh-badge">{saved.length}</span>}
                {m.items.length > 1 && <span className="sh-caret">▾</span>}
              </button>
              {m.items.length > 1 && open === m.id && (
                <div className="sh-dropdown">
                  {m.items.map((i) => (
                    <button key={i.label} className="sh-drop-link" onClick={() => go(i.route)}>
                      {i.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="sh-actions">
          <ThemeToggle compact />
          <button className="sh-cta" onClick={() => go("forge")}>Invoquer</button>
          <button className="sh-burger" onClick={() => setMobile((v) => !v)} aria-label="Menu">☰</button>
        </div>
      </div>
    </header>
  );
}
