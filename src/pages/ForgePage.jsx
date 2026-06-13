import { useEffect, useRef, useState } from "react";
import { generateBatch, generateOne } from "../lib/generator.js";
import { LEGION_PREFIX, HUMAN_ETHNIES, RACES, CONVENTIONS } from "../data/races.js";
import { useChest } from "../context/ChestContext.jsx";
import RaceSeals from "../components/RaceSeals.jsx";
import NameCard from "../components/NameCard.jsx";
import Divider from "../components/Divider.jsx";

const ALPHA = "Toutes ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(" ").flatMap((x) => (x === "Toutes" ? ["Toutes"] : x.split("")));

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

export default function ForgePage() {
  const { toggleSave, isSaved } = useChest();
  const [race, setRace] = useState("Aléatoire");
  const [sex, setSex] = useState("Aléatoire");
  const [format, setFormat] = useState("full");
  const [sound, setSound] = useState("Toutes");
  const [legion, setLegion] = useState("Aléatoire");
  const [ethnie, setEthnie] = useState("Aléatoire");
  const [count, setCount] = useState(10);

  // Filtres avancés
  const [showAdv, setShowAdv] = useState(false);
  const [initial, setInitial] = useState("Toutes");
  const [maxLen, setMaxLen] = useState(0);
  const [noRepeat, setNoRepeat] = useState(true);

  // Affichage
  const [grid, setGrid] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [results, setResults] = useState([]);
  const seenRef = useRef(new Set());

  const opts = () => ({
    race, sex, format, sound,
    legion: legion === "Aléatoire" ? null : LEGION_PREFIX[legion],
    ethnie,
    initial,
    maxLen: maxLen > 0 ? maxLen : undefined,
  });

  const generate = () => {
    const batch = generateBatch(opts(), count, noRepeat ? seenRef.current : null);
    batch.forEach((n) => seenRef.current.add(n.full));
    setResults(batch);
  };

  const regenOne = (id) => {
    let n = null;
    for (let k = 0; k < 60 && !n; k++) {
      const cand = generateOne(opts());
      if (cand && !(noRepeat && seenRef.current.has(cand.full))) n = cand;
    }
    if (n) { seenRef.current.add(n.full); setResults((p) => p.map((x) => (x.id === id ? n : x))); }
  };

  const resetSeen = () => { seenRef.current = new Set(); };

  // Raccourcis clavier : Espace/Entrée = invoquer, G = grille/liste
  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === "SELECT" || tag === "INPUT") return;
      if (e.code === "Space" || e.code === "Enter") { e.preventDefault(); generate(); }
      if (e.key.toLowerCase() === "g") setGrid((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const showLegion = race === "Charr", showEthnie = race === "Humain";

  return (
    <div>
      <RaceSeals value={race} onChange={(v) => { setRace(v); setShowInfo(false); }} />

      <div className="panel controls">
        <Field label="Race" value={race} onChange={(v) => { setRace(v); setShowInfo(false); }} options={["Aléatoire", ...RACES]} />
        <Field label="Sexe" value={sex} onChange={setSex} options={["Aléatoire", { value: "M", label: "Masculin" }, { value: "F", label: "Féminin" }]} />
        <Field label="Format" value={format} onChange={setFormat} options={[{ value: "full", label: "Prénom + Nom" }, { value: "first", label: "Prénom seul" }, { value: "last", label: "Nom seul" }]} />
        <Field label="Sonorité" value={sound} onChange={setSound} options={["Toutes", "Douce", "Dure"]} />
        {showLegion && <Field label="Légion charr" value={legion} onChange={setLegion} options={["Aléatoire", ...Object.keys(LEGION_PREFIX)]} />}
        {showEthnie && <Field label="Ethnie humaine" value={ethnie} onChange={setEthnie} options={["Aléatoire", ...HUMAN_ETHNIES]} />}
      </div>

      {/* Filtres avancés (menu déroulant) */}
      <div className="adv">
        <button className="adv-toggle" onClick={() => setShowAdv((v) => !v)} aria-expanded={showAdv}>
          {showAdv ? "▾" : "▸"} Filtres avancés
        </button>
        {showAdv && (
          <div className="panel adv-body">
            <Field label="Initiale" value={initial} onChange={setInitial} options={ALPHA} />
            <Field label="Longueur max" value={String(maxLen)} onChange={(v) => setMaxLen(Number(v))}
              options={[{ value: "0", label: "Sans limite" }, { value: "6", label: "≤ 6" }, { value: "8", label: "≤ 8" }, { value: "10", label: "≤ 10" }, { value: "12", label: "≤ 12" }]} />
            <label className="check">
              <input type="checkbox" checked={noRepeat} onChange={(e) => setNoRepeat(e.target.checked)} />
              Éviter les répétitions
            </label>
            <button className="mini-btn clear" onClick={resetSeen}>Réinitialiser l'historique</button>
          </div>
        )}
      </div>

      {race !== "Aléatoire" && (
        <div className="tradition">
          <button className="tradition-toggle" onClick={() => setShowInfo((v) => !v)}>
            {showInfo ? "▾" : "▸"} Tradition de nommage — {race}
          </button>
          {showInfo && <p className="tradition-body">{CONVENTIONS[race]}</p>}
        </div>
      )}

      <div className="genbar">
        <label className="count-control">
          <span className="lab">Nombre</span>
          <input type="range" min={1} max={20} value={count} onChange={(e) => setCount(Number(e.target.value))} />
          <span className="val">{count}</span>
        </label>
        <button className="view-toggle" onClick={() => setGrid((v) => !v)} title="Basculer grille / liste (G)">
          {grid ? "☰ Liste" : "▦ Grille"}
        </button>
        <button className="summon-btn" onClick={generate}>
          <span className="ico">✦</span> Invoquer
        </button>
      </div>

      <p className="hint">Astuce : <kbd>Espace</kbd> pour relancer · <kbd>G</kbd> pour changer l'affichage</p>

      {results.length === 0 ? (
        <p className="empty">Choisis tes paramètres, puis invoque tes héros. Garde tes trouvailles dans le coffre, copie-les ou reforge un nom isolé.</p>
      ) : (
        <ul className={`results${grid ? " grid" : ""}`} aria-live="polite">
          {results.map((r, i) => (
            <NameCard key={r.id} r={r} index={i} grid={grid}
              onRegen={regenOne} onToggleSave={toggleSave} saved={isSaved(r)} />
          ))}
        </ul>
      )}

      <Divider />
    </div>
  );
}
