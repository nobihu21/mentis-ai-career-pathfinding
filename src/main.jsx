import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { VisualModeProvider } from "./contexts/VisualModeContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <VisualModeProvider>
      <App />
    </VisualModeProvider>
  </React.StrictMode>
);
