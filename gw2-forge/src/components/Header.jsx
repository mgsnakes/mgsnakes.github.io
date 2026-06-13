import DragonGlyph from "./DragonGlyph.jsx";

export default function Header() {
  return (
    <header className="hero">
      <div className="hero-glyph">
        <DragonGlyph size={104} />
      </div>
      <p className="hero-eyebrow">Les Royaumes de Tyrie</p>
      <h1 className="hero-title">Forge des Noms</h1>
      <p className="hero-sub">
        Nomme ton héros selon les traditions des cinq peuples de Guild&nbsp;Wars
      </p>
      <p className="hero-count">Plus de 860&nbsp;000 noms possibles · ~200 prénoms par race</p>
    </header>
  );
}
