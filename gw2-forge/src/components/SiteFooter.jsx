import Logotype from "./Logotype.jsx";

const COLS = [
  { title: "Forge", links: [["Générateur de noms", "forge"], ["Warbands charr", "warbands"], ["Noms de guilde", "guildes"]] },
  { title: "Univers", links: [["Les peuples", "peuples"], ["Conventions de nommage", "peuples"]] },
  { title: "Mes données", links: [["Le coffre", "coffre"]] },
];

export default function SiteFooter({ navigate }) {
  return (
    <footer className="site-footer">
      <div className="sf-inner">
        <div className="sf-brand">
          <Logotype height={40} />
          <p className="sf-tagline">Un générateur de noms fidèle au lore de Guild Wars 2.</p>
          <p className="sf-follow">Suivez le lore</p>
          <div className="sf-social" aria-label="Réseaux">
            {["✦", "❧", "⚔", "◈", "❄"].map((g, i) => <span key={i} className="sf-soc">{g}</span>)}
          </div>
        </div>

        <div className="sf-cols">
          {COLS.map((c) => (
            <div key={c.title} className="sf-col">
              <h4>{c.title}</h4>
              {c.links.map(([label, route]) => (
                <button key={label} className="sf-link" onClick={() => navigate(route)}>{label}</button>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="sf-legal">
        <span>Conventions d'après wiki.guildwars2.com · Noms générés fictifs.</span>
        <span>Projet de fan non affilié à ArenaNet / NCSOFT. Logo et visuels recréés, sans asset propriétaire.</span>
      </div>
    </footer>
  );
}
