import { useState } from "react";
import { generateWarband, WARBAND_THEME_LIST } from "../lib/generator.js";
import { LEGION_PREFIX, RACE_COLOR } from "../data/races.js";
import { useChest } from "../context/ChestContext.jsx";

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

export default function WarbandsPage() {
  const { toggleSave, isSaved } = useChest();
  const [legion, setLegion] = useState("Aléatoire");
  const [theme, setTheme] = useState("Aléatoire");
  const [size, setSize] = useState(6);
  const [wb, setWb] = useState(null);
  const [copied, setCopied] = useState(false);

  const generate = () => {
    setWb(generateWarband({
      legion: legion === "Aléatoire" ? null : LEGION_PREFIX[legion],
      theme,
      size,
    }));
    setCopied(false);
  };

  const copyAll = () => {
    if (!wb) return;
    const text = `Warband ${wb.warband}${wb.legion ? ` (${wb.legion})` : ""} · ${wb.theme}\n` +
      wb.members.map((m) => `• ${m.full} — ${m.rank}`).join("\n");
    navigator.clipboard?.writeText(text);
    setCopied(true); setTimeout(() => setCopied(false), 1400);
  };

  const c = RACE_COLOR.Charr;

  return (
    <div>
      <header className="page-head">
        <h1 className="page-title">Générateur de warband</h1>
        <p className="page-sub">
          Une warband charr complète : prénoms romains, nom de warband partagé,
          rôles distincts et hiérarchie. Le thème oriente les rôles — une warband
          des Flammes brûle, une warband de Sang déchire.
        </p>
      </header>

      <div className="panel controls">
        <Field label="Thème" value={theme} onChange={setTheme} options={["Aléatoire", ...WARBAND_THEME_LIST]} />
        <Field label="Légion" value={legion} onChange={setLegion} options={["Aléatoire", ...Object.keys(LEGION_PREFIX)]} />
        <Field label="Effectif" value={String(size)} onChange={(v) => setSize(Number(v))}
          options={[4, 5, 6, 7, 8].map((n) => ({ value: String(n), label: `${n} membres` }))} />
      </div>

      <p className="hint">Astuce : choisir une légion de Fer / Sang / Cendres / Flammes verrouille son thème de rôles.</p>

      <div className="genbar">
        <button className="summon-btn" onClick={generate} style={{ marginLeft: 0 }}>
          <span className="ico">⚔</span> Former la warband
        </button>
        {wb && (
          <button className="view-toggle" onClick={copyAll} style={{ marginLeft: "auto" }}>
            {copied ? "✓ Copié" : "⧉ Copier la liste"}
          </button>
        )}
      </div>

      {!wb ? (
        <p className="empty">Choisis un thème, une légion et un effectif, puis forme ta warband.</p>
      ) : (
        <div className="warband-card" style={{ "--accent": c }}>
          <div className="warband-banner">
            <span className="wb-glyph">⚔</span>
            <div>
              <div className="wb-name">Warband {wb.warband}</div>
              <div className="wb-legion">{wb.legion || "Warband indépendante"} · {wb.theme}</div>
            </div>
          </div>
          <ul className="warband-list">
            {wb.members.map((m, i) => (
              <li key={m.id} className="wb-member" style={{ animationDelay: `${i * 60}ms` }}>
                <span className="wb-rank">{m.rank}</span>
                <span className="wb-member-name">{m.full}</span>
                <button
                  className={`icon-btn${isSaved(m) ? " on" : ""}`}
                  style={{ "--on-bg": "var(--gold)" }}
                  title={isSaved(m) ? "Retirer du coffre" : "Garder dans le coffre"}
                  onClick={() => toggleSave({ ...m, race: "Charr", detail: `Warband ${wb.warband} · ${wb.theme}`, meaning: m.rank })}
                >
                  {isSaved(m) ? "★" : "☆"}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
