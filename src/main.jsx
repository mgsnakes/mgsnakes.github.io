import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { ChestProvider } from "./context/ChestContext.jsx";
import { VisualProvider } from "./context/VisualContext.jsx";
import App from "./App.jsx";
import "./styles/theme.css";
import "./styles/global.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <VisualProvider>
        <ChestProvider>
          <App />
        </ChestProvider>
      </VisualProvider>
    </ThemeProvider>
  </StrictMode>
);
