import { useState } from "react";
import { RACE_COLOR } from "../data/races.js";

const sexLabel = (id) => (id === "M" ? "Masculin" : "Féminin");

export default function NameCard({ r, index, onRegen, onToggleSave, saved, grid }) {
  const [copied, setCopied] = useState(null);

  const copy = (mode) => {
    const text = mode === "lore" ? `${r.full} — ${r.detail}. ${r.meaning}` : r.full;
    navigator.clipboard?.writeText(text);
    setCopied(mode);
    setTimeout(() => setCopied((c) => (c === mode ? null : c)), 1300);
  };

  return (
    <li
      className={`row${grid ? " grid" : ""}`}
      style={{ "--dot-color": RACE_COLOR[r.race], animationDelay: `${index * 40}ms` }}
    >
      <span className="dot" />
      <div className="body">
        <div className="full">{r.full}</div>
        <div className="meta">
          {r.race} · {sexLabel(r.sex)} — <em>{r.detail}</em>
          <br />
          <span className="meaning">{r.meaning}</span>
        </div>
      </div>

      <div className="row-actions">
        <button
          className={`icon-btn${copied === "name" ? " on" : ""}`}
          style={{ "--on-bg": "var(--green)" }}
          title="Copier le nom" onClick={() => copy("name")}
        >
          {copied === "name" ? "✓" : "⧉"}
        </button>
        <button
          className={`icon-btn${copied === "lore" ? " on" : ""}`}
          style={{ "--on-bg": "var(--green)" }}
          title="Copier nom + lore" onClick={() => copy("lore")}
        >
          {copied === "lore" ? "✓" : "❧"}
        </button>
        <button className="icon-btn" title="Reforger ce nom" onClick={() => onRegen(r.id)}>⟳</button>
        <button
          className={`icon-btn${saved ? " on" : ""}`}
          style={{ "--on-bg": "var(--gold)" }}
          title={saved ? "Retirer du coffre" : "Garder dans le coffre"}
          onClick={() => onToggleSave(r)}
        >
          {saved ? "★" : "☆"}
        </button>
      </div>
    </li>
  );
}
