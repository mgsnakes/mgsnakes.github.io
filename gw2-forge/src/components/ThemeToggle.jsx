import { useTheme } from "../context/ThemeContext.jsx";

export default function ThemeToggle({ compact }) {
  const { theme, toggle } = useTheme();
  const label = theme === "dark" ? "☀" : "☾";
  return (
    <button
      className={compact ? "sh-icon-btn" : "ghost-btn"}
      onClick={toggle}
      aria-label="Changer de thème"
      title={theme === "dark" ? "Mode clair" : "Mode sombre"}
    >
      {compact ? label : (theme === "dark" ? "☀ Mode clair" : "☾ Mode sombre")}
    </button>
  );
}
