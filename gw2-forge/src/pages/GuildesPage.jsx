import { useState } from "react";
import { generateGuilds, GUILD_THEMES } from "../lib/generator.js";
import { useChest } from "../context/ChestContext.jsx";

const ALPHA = ["Toutes", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")];

function Field({ label, value, onChange, options }) {
  return (
    <div className="field">
      <label>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
      </select>
    </div>
  );
}

export default function GuildesPage() {
  const { toggleSave, isSaved } = useChest();
  const [guilds, setGuilds] = useState([]);
  const [count, setCount] = useState(8);
  const [copiedId, setCopiedId] = useState(null);

  // Critères
  const [theme, setTheme] = useState("Aléatoire");
  const [structure, setStructure] = useState("any");
  const [tagLen, setTagLen] = useState(0);
  const [initial, setInitial] = useState("Toutes");

  const generate = () => setGuilds(generateGuilds(count, { theme, structure, tagLen: Number(tagLen), initial }));
  const copy = (g) => {
    navigator.clipboard?.writeText(`${g.name} ${g.tag}`);
    setCopiedId(g.id); setTimeout(() => setCopiedId((c) => (c === g.id ? null : c)), 1300);
  };

  return (
    <div>
      <header className="page-head">
        <h1 className="page-title">Générateur de guilde</h1>
        <p className="page-sub">
          Un nom de guilde épique et son tag, dans l'esprit des ordres et compagnies
          de Tyrie. Plus de 65 000 noms possibles, répartis en six thèmes.
        </p>
      </header>

      <div className="panel controls">
        <Field label="Thème" value={theme} onChange={setTheme} options={["Aléatoire", ...GUILD_THEMES]} />
        <Field label="Structure" value={structure} onChange={setStructure}
          options={[
            { value: "any", label: "Aléatoire" },
            { value: "two", label: "Deux mots (Iron Vanguard)" },
            { value: "of", label: "Avec « of… » (… of the Mists)" },
            { value: "single", label: "Un mot épique (Requiem)" },
          ]} />
        <Field label="Tag" value={String(tagLen)} onChange={setTagLen}
          options={[{ value: "0", label: "Aléatoire (2-4)" }, { value: "2", label: "2 lettres" }, { value: "3", label: "3 lettres" }, { value: "4", label: "4 lettres" }]} />
        <Field label="Initiale" value={initial} onChange={setInitial} options={ALPHA} />
      </div>

      <div className="genbar">
        <label className="count-control">
          <span className="lab">Nombre</span>
          <input type="range" min={1} max={16} value={count} onChange={(e) => setCount(Number(e.target.value))} />
          <span className="val">{count}</span>
        </label>
        <button className="summon-btn" onClick={generate}>
          <span className="ico">⚑</span> Fonder
        </button>
      </div>

      {guilds.length === 0 ? (
        <p className="empty">Choisis un thème (ou laisse au hasard) et forge le nom de ta prochaine compagnie.</p>
      ) : (
        <ul className="results" aria-live="polite">
          {guilds.map((g, i) => {
            const item = { full: `${g.name} ${g.tag}`, race: "Humain", detail: `Guilde · ${g.theme}`, meaning: `Tag ${g.tag}` };
            return (
              <li key={g.id} className="row" style={{ "--dot-color": "var(--gold)", animationDelay: `${i * 40}ms` }}>
                <span className="dot" />
                <div className="body">
                  <div className="full">{g.name} <span className="guild-tag">{g.tag}</span></div>
                  <div className="meta"><em>{g.theme}</em></div>
                </div>
                <div className="row-actions">
                  <button className={`icon-btn${copiedId === g.id ? " on" : ""}`} style={{ "--on-bg": "var(--green)" }} title="Copier" onClick={() => copy(g)}>
                    {copiedId === g.id ? "✓" : "⧉"}
                  </button>
                  <button className={`icon-btn${isSaved(item) ? " on" : ""}`} style={{ "--on-bg": "var(--gold)" }}
                    title={isSaved(item) ? "Retirer du coffre" : "Garder"} onClick={() => toggleSave(item)}>
                    {isSaved(item) ? "★" : "☆"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
