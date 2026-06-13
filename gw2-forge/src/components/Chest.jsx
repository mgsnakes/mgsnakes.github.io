import { RACE_COLOR } from "../data/races.js";

export default function Chest({ saved, onToggleSave, onClear }) {
  const copyAll = () => navigator.clipboard?.writeText(saved.map((x) => x.full).join("\n"));

  return (
    <div className="panel chest">
      <div className="chest-head">
        <span className="chest-title">⚜ Noms gardés</span>
        {saved.length > 0 && (
          <div className="chest-actions">
            <button className="mini-btn copy" onClick={copyAll}>Tout copier</button>
            <button className="mini-btn clear" onClick={onClear}>Vider</button>
          </div>
        )}
      </div>

      {saved.length === 0 ? (
        <p className="chest-empty">
          Marque un nom de l'étoile ☆ pour le déposer dans ton coffre.
          Il y restera même après fermeture de la page.
        </p>
      ) : (
        <div className="chips">
          {saved.map((r) => (
            <span key={r.id} className="chip" style={{ "--dot-color": RACE_COLOR[r.race] }}>
              <span className="cdot" />
              {r.full}
              <button className="x" onClick={() => onToggleSave(r)} aria-label="Retirer">×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
