import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

function renderApp() {
  const root = document.getElementById("root");

  if (!root) {
    document.body.innerHTML = "<h1>Root element missing</h1>";
    return;
  }

  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

try {
  renderApp();
} catch (err) {
  console.error("Fatal render error:", err);
  document.body.innerHTML = "<h1>App crashed</h1>";
}
