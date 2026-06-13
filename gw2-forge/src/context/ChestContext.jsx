import { createContext, useContext, useEffect, useState } from "react";

const ChestContext = createContext(null);

/** Le coffre (favoris) est partagé par toutes les pages et persisté. */
export function ChestProvider({ children }) {
  const [saved, setSaved] = useState(() => {
    try { return JSON.parse(localStorage.getItem("gw2-chest") || "[]"); } catch { return []; }
  });
  useEffect(() => {
    try { localStorage.setItem("gw2-chest", JSON.stringify(saved)); } catch { /* ignore */ }
  }, [saved]);

  const toggleSave = (item) =>
    setSaved((p) => (p.some((x) => x.full === item.full) ? p.filter((x) => x.full !== item.full) : [...p, item]));
  const isSaved = (item) => saved.some((x) => x.full === item.full);
  const remove = (full) => setSaved((p) => p.filter((x) => x.full !== full));
  const clear = () => setSaved([]);

  return (
    <ChestContext.Provider value={{ saved, toggleSave, isSaved, remove, clear }}>
      {children}
    </ChestContext.Provider>
  );
}

export const useChest = () => useContext(ChestContext);
