import { useEffect, useState } from "react";

/** Routeur minimal basé sur le hash de l'URL (#/forge, #/warbands, …).
 *  Permet le partage par URL et la navigation arrière du navigateur. */
const DEFAULT = "forge";

export function useHashRoute() {
  const parse = () => (window.location.hash.replace(/^#\/?/, "") || DEFAULT).split("?")[0];
  const [route, setRoute] = useState(parse);

  useEffect(() => {
    const onHash = () => setRoute(parse());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const navigate = (r) => { window.location.hash = `#/${r}`; };
  return [route, navigate];
}
