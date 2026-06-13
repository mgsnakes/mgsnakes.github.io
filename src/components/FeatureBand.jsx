import Scenery from "./Scenery.jsx";
import { useVisual } from "../context/VisualContext.jsx";

/** Bande pleine largeur façon guildwars2.com : visuel d'un côté, texte de
 *  l'autre, avec lien « EN SAVOIR PLUS ». Alterne selon `flip`. */
export default function FeatureBand({ kicker, title, text, cta, onCta, variant, tint, flip }) {
  const { visual } = useVisual();
  return (
    <section className={`band${flip ? " flip" : ""}`}>
      <div className="band-media">
        {visual === "scenery"
          ? <Scenery variant={variant} tint={tint} height={320} />
          : <div className="band-gradient" style={{ "--tint": tint }} />}
        <div className="band-media-fade" />
      </div>
      <div className="band-text">
        <p className="band-kicker" style={{ color: tint }}>{kicker}</p>
        <h2 className="band-title">{title}</h2>
        <p className="band-body">{text}</p>
        <button className="band-cta" onClick={onCta}>{cta} →</button>
      </div>
    </section>
  );
}
