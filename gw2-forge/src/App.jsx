import { useHashRoute } from "./hooks/useHashRoute.js";
import SiteHeader from "./components/SiteHeader.jsx";
import SiteFooter from "./components/SiteFooter.jsx";
import Hero from "./components/Hero.jsx";
import FeatureBand from "./components/FeatureBand.jsx";
import ForgePage from "./pages/ForgePage.jsx";
import WarbandsPage from "./pages/WarbandsPage.jsx";
import GuildesPage from "./pages/GuildesPage.jsx";
import PeuplesPage from "./pages/PeuplesPage.jsx";
import CoffrePage from "./pages/CoffrePage.jsx";
import LoreSection from "./components/LoreSection.jsx";
import OfficialConventions from "./components/OfficialConventions.jsx";
import Divider from "./components/Divider.jsx";

const PAGES = { forge: ForgePage, warbands: WarbandsPage, guildes: GuildesPage, peuples: PeuplesPage, coffre: CoffrePage };
const TITLES = {
  forge: null, // la page forge a le hero
  warbands: "Warbands",
  guildes: "Guildes",
  peuples: "Les Peuples de Tyrie",
  coffre: "Le Coffre",
};

export default function App() {
  const [route, navigate] = useHashRoute();
  const Page = PAGES[route] || ForgePage;
  const isHome = route === "forge";

  return (
    <div className="app">
      <SiteHeader route={route} navigate={navigate} />

      {isHome && <Hero navigate={navigate} />}

      {/* Bandes de présentation, seulement sur la home, façon site officiel */}
      {isHome && (
        <div className="bands">
          <FeatureBand
            kicker="Cinq peuples, cinq traditions" title="Des noms fidèles au lore"
            text="Chaque race suit sa vraie convention de nommage : warbands charr, patronymes norns, double consonne asura, cycles sylvaris, ethnies humaines. Plus de 860 000 noms possibles."
            cta="Explorer les peuples" onCta={() => navigate("peuples")}
            variant="forest" tint="#6fae54" />
          <FeatureBand
            kicker="Pour les charrs" title="Forge une warband entière"
            text="Génère une unité de combat complète : prénoms romains, nom de warband partagé, rôles distincts et hiérarchie, du tribun aux soldats."
            cta="Former une warband" onCta={() => navigate("warbands")}
            variant="city" tint="#c0563a" flip />
          <FeatureBand
            kicker="Compagnies & ordres" title="Nomme ta guilde"
            text="Un nom de guilde épique et son tag court, dans l'esprit des grands ordres de Tyrie."
            cta="Fonder une guilde" onCta={() => navigate("guildes")}
            variant="desert" tint="#d8a64a" />
        </div>
      )}

      <main className="shell page">
        {!isHome && (
          <header className="route-head">
            <button className="back-link" onClick={() => navigate("forge")}>← Accueil</button>
          </header>
        )}
        <Page />

        {isHome && (
          <>
            <LoreSection />
            <Divider />
            <OfficialConventions />
          </>
        )}
      </main>

      <SiteFooter navigate={navigate} />
    </div>
  );
}
