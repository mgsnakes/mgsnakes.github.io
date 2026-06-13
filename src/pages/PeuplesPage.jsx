import { useState } from "react";
import { RACE_LORE, LORE_RACES } from "../data/lore.js";

export default function PeuplesPage() {
  const [active, setActive] = useState("Humain");
  const r = RACE_LORE[active];

  return (
    <div>
      <header className="page-head">
        <h1 className="page-title">Les peuples de Tyrie</h1>
        <p className="page-sub">
          Cinq races jouables, cinq traditions de nommage. Choisis un peuple pour
          découvrir son histoire, sa convention et des exemples canon.
        </p>
      </header>

      {/* Sélecteur d'onglets de race */}
      <div className="people-tabs">
        {LORE_RACES.map((id) => (
          <button
            key={id}
            className={`people-tab${active === id ? " active" : ""}`}
            style={{ "--accent": RACE_LORE[id].color }}
            onClick={() => setActive(id)}
            aria-pressed={active === id}
          >
            <span className="people-glyph">{RACE_LORE[id].glyph}</span>
            {id}
          </button>
        ))}
      </div>

      {/* Fiche */}
      <article className="people-card" style={{ "--accent": r.color }}>
        <div className="people-header">
          <span className="people-big-glyph">{r.glyph}</span>
          <div>
            <h2 className="people-name">{active}</h2>
            <p className="people-tagline">{r.tagline} · {r.home}</p>
          </div>
        </div>

        <p className="people-intro">{r.intro}</p>

        <h3 className="people-h3">Convention de nommage</h3>
        <p className="people-convention">{r.convention}</p>

        <h3 className="people-h3">Exemples canon</h3>
        <div className="people-examples">
          {r.examples.map((ex) => <span key={ex} className="example-chip">{ex}</span>)}
        </div>
      </article>
    </div>
  );
}
