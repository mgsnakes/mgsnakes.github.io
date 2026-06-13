import { createContext, useContext, useEffect, useState } from "react";

const VisualContext = createContext(null);

/** Style des bannières : "scenery" (paysages SVG) ou "gradient" (dégradés seuls). */
export function VisualProvider({ children }) {
  const [visual, setVisual] = useState(() => {
    try { return localStorage.getItem("gw2-visual") || "scenery"; } catch { return "scenery"; }
  });
  useEffect(() => {
    try { localStorage.setItem("gw2-visual", visual); } catch { /* ignore */ }
  }, [visual]);
  const toggle = () => setVisual((v) => (v === "scenery" ? "gradient" : "scenery"));
  return (
    <VisualContext.Provider value={{ visual, setVisual, toggle }}>
      {children}
    </VisualContext.Provider>
  );
}
export const useVisual = () => useContext(VisualContext);
