import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Keep the existing custom element badge (used inside React cards)
import "./components/reusable-components/sim-badge.js";
import "./components/reusable-components/sim-decoration.js";
import "./components/reusable-components/sim-header.js";
import "./components/reusable-components/sim-footer.js";

import { ToastProvider } from "./components/reusable-components/toast";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </React.StrictMode>,
);

// Used by index.html fallback to detect whether the React app mounted.
(window as any).__SIMHUB_MOUNTED__ = true;
