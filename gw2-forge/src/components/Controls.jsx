import { useState } from "react";
import { HUMAN_ETHNIES, LEGION_PREFIX, CONVENTIONS } from "../data/races.js";

function Field({ label, value, onChange, options }) {
  return (
    <div className="field">
      <label>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
        ))}
      </select>
    </div>
  );
}

export default function Controls({ gen }) {
  const [showInfo, setShowInfo] = useState(false);
  const showLegion = gen.race === "Charr";
  const showEthnie = gen.race === "Humain";

  return (
    <>
      <div className="panel controls">
        <Field
          label="Race" value={gen.race}
          onChange={(v) => { gen.setRace(v); setShowInfo(false); }}
          options={["Aléatoire", "Humain", "Charr", "Norn", "Asura", "Sylvari"]}
        />
        <Field
          label="Sexe" value={gen.sex} onChange={gen.setSex}
          options={["Aléatoire", { value: "M", label: "Masculin" }, { value: "F", label: "Féminin" }]}
        />
        <Field
          label="Format" value={gen.format} onChange={gen.setFormat}
          options={[
            { value: "full", label: "Prénom + Nom" },
            { value: "first", label: "Prénom seul" },
            { value: "last", label: "Nom seul" },
          ]}
        />
        <Field
          label="Sonorité" value={gen.sound} onChange={gen.setSound}
          options={["Toutes", "Douce", "Dure"]}
        />
        {showLegion && (
          <Field
            label="Légion charr" value={gen.legion} onChange={gen.setLegion}
            options={["Aléatoire", ...Object.keys(LEGION_PREFIX)]}
          />
        )}
        {showEthnie && (
          <Field
            label="Ethnie humaine" value={gen.ethnie} onChange={gen.setEthnie}
            options={["Aléatoire", ...HUMAN_ETHNIES]}
          />
        )}
      </div>

      {gen.race !== "Aléatoire" && (
        <div>
          <button className="tradition-toggle" onClick={() => setShowInfo((v) => !v)}>
            {showInfo ? "▾" : "▸"} Tradition de nommage — {gen.race}
          </button>
          {showInfo && <p className="tradition-body">{CONVENTIONS[gen.race]}</p>}
        </div>
      )}
    </>
  );
}
