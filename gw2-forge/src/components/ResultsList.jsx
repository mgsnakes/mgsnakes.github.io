import NameCard from "./NameCard.jsx";

export default function ResultsList({ results, onRegen, onToggleSave, isSaved }) {
  if (results.length === 0) {
    return (
      <p className="empty">
        Choisis tes paramètres, puis invoque tes héros. Garde tes trouvailles
        dans le coffre, copie-les ou reforge un nom isolé.
      </p>
    );
  }
  return (
    <ul className="results">
      {results.map((r, i) => (
        <NameCard
          key={r.id} r={r} index={i}
          onRegen={onRegen} onToggleSave={onToggleSave}
          saved={isSaved(r)}
        />
      ))}
    </ul>
  );
}
