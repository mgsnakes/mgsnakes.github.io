import { useState } from "react";
import { useChest } from "../context/ChestContext.jsx";
import { RACE_COLOR } from "../data/races.js";

export default function CoffrePage() {
  const { saved, remove, clear } = useChest();
  const [copied, setCopied] = useState(false);

  const copyAll = () => {
    navigator.clipboard?.writeText(saved.map((x) => x.full).join("\n"));
    setCopied(true); setTimeout(() => setCopied(false), 1400);
  };

  const exportTxt = () => {
    const blob = new Blob([saved.map((x) => `${x.full}${x.detail ? "  —  " + x.detail : ""}`).join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "coffre-tyrie.txt"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <header className="page-head">
        <h1 className="page-title">Le coffre</h1>
        <p className="page-sub">
          Tes noms gardés, conservés d'une visite à l'autre. Copie-les ou exporte-les
          dans un fichier texte.
        </p>
      </header>

      {saved.length === 0 ? (
        <p className="empty">Ton coffre est vide. Marque des noms de l'étoile ☆ depuis n'importe quelle page pour les ranger ici.</p>
      ) : (
        <>
          <div className="chest-bar">
            <span className="chest-count">{saved.length} nom{saved.length > 1 ? "s" : ""}</span>
            <div className="chest-actions">
              <button className="mini-btn copy" onClick={copyAll}>{copied ? "✓ Copié" : "Tout copier"}</button>
              <button className="mini-btn copy" onClick={exportTxt}>Exporter .txt</button>
              <button className="mini-btn clear" onClick={clear}>Vider</button>
            </div>
          </div>

          <ul className="results">
            {saved.map((r, i) => (
              <li key={r.full + i} className="row" style={{ "--dot-color": RACE_COLOR[r.race] || "var(--gold)" }}>
                <span className="dot" />
                <div className="body">
                  <div className="full">{r.full}</div>
                  {r.detail && <div className="meta"><em>{r.detail}</em></div>}
                </div>
                <div className="row-actions">
                  <button className="icon-btn" title="Retirer" onClick={() => remove(r.full)}>×</button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
