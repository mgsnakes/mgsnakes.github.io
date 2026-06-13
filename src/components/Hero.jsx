import Scenery from "./Scenery.jsx";
import { useVisual } from "../context/VisualContext.jsx";

/** Hero plein écran : titre massif en capitales, accroche, boutons,
 *  arrière-plan paysage SVG (ou dégradé selon la préférence). */
export default function Hero({ navigate }) {
  const { visual, toggle } = useVisual();
  return (
    <section className="hero-full">
      <div className="hero-bg">
        {visual === "scenery" && <Scenery variant="peaks" tint="var(--red)" height={560} />}
      </div>
      <div className="hero-overlay" />
      <div className="hero-content">
        <p className="hero-kicker">Les Royaumes de Tyrie</p>
        <h1 className="hero-h1">Le Monde<br />Est à Toi</h1>
        <p className="hero-lead">
          Forge le nom de ton héros selon les vraies traditions des cinq peuples de
          Guild Wars — humains, charrs, norns, asuras et sylvaris.
        </p>
        <div className="hero-cta-row">
          <button className="btn-primary" onClick={() => navigate("forge")}>Commencer à forger</button>
          <button className="btn-ghost" onClick={() => navigate("peuples")}>Découvrir les peuples</button>
        </div>
        <button className="visual-switch" onClick={toggle}>
          {visual === "scenery" ? "◳ Fond : paysages" : "◳ Fond : dégradé"} · changer
        </button>
      </div>
      <div className="hero-scroll" aria-hidden>▾</div>
    </section>
  );
}
