import { RACES_META } from "../data/races.js";

/** Bandeau de "sceaux" : sélection visuelle de la race.
 *  Cliquer un sceau actif le désélectionne (retour à Aléatoire). */
export default function RaceSeals({ value, onChange }) {
  return (
    <div className="seals">
      {RACES_META.map((r) => {
        const active = value === r.id;
        return (
          <button
            key={r.id}
            className={`seal${active ? " active" : ""}`}
            style={{ "--seal-color": r.color }}
            onClick={() => onChange(active ? "Aléatoire" : r.id)}
            aria-pressed={active}
          >
            <div className="glyph">{r.glyph}</div>
            <div className="name">{r.id}</div>
            <div className="home">{r.home}</div>
          </button>
        );
      })}
    </div>
  );
}
