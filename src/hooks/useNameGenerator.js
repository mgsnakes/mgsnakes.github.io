import { useEffect, useState } from "react";
import { generateBatch, generateOne } from "../lib/generator.js";
import { LEGION_PREFIX } from "../data/races.js";

/** Centralise l'état des contrôles, des résultats et du coffre. */
export function useNameGenerator() {
  const [race, setRace] = useState("Aléatoire");
  const [sex, setSex] = useState("Aléatoire");
  const [format, setFormat] = useState("full");
  const [sound, setSound] = useState("Toutes");
  const [legion, setLegion] = useState("Aléatoire");
  const [ethnie, setEthnie] = useState("Aléatoire");
  const [count, setCount] = useState(10);

  const [results, setResults] = useState([]);
  const [saved, setSaved] = useState(() => {
    try { return JSON.parse(localStorage.getItem("gw2-chest") || "[]"); } catch { return []; }
  });

  // Persistance du coffre (fonctionne en projet hébergé).
  useEffect(() => {
    try { localStorage.setItem("gw2-chest", JSON.stringify(saved)); } catch { /* ignore */ }
  }, [saved]);

  const opts = () => ({
    race, sex, format, sound,
    legion: legion === "Aléatoire" ? null : LEGION_PREFIX[legion],
    ethnie,
  });

  const generate = () => setResults(generateBatch(opts(), count));

  const regenOne = (id) => {
    let n = null;
    for (let k = 0; k < 40 && !n; k++) n = generateOne(opts());
    if (n) setResults((p) => p.map((x) => (x.id === id ? n : x)));
  };

  const toggleSave = (r) =>
    setSaved((p) => (p.some((x) => x.id === r.id) ? p.filter((x) => x.id !== r.id) : [...p, r]));
  const isSaved = (r) => saved.some((x) => x.id === r.id);
  const clearChest = () => setSaved([]);

  return {
    // contrôles
    race, setRace, sex, setSex, format, setFormat, sound, setSound,
    legion, setLegion, ethnie, setEthnie, count, setCount,
    // résultats
    results, generate, regenOne,
    // coffre
    saved, toggleSave, isSaved, clearChest,
  };
}
