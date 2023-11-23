import React from "react";
import ReactDOM from "react-dom/client";

import { App } from "~/components";
import { AppContextProvider } from "~/context";
import { ThemeProvider } from "~/theme";

//================================================

const container = document.getElementById("root");
if (!container) {
  throw new Error(
    `ERROR: Failed to find root container to mount React app; check index.html`,
  );
}

const root = ReactDOM.createRoot(container);

//================================================

const renderApp = (node: React.ReactNode) => {
  if (import.meta.env.DEV) {
    root.render(<React.StrictMode>{node}</React.StrictMode>);
  } else {
    root.render(node);
  }
};

//================================================

renderApp(
  <ThemeProvider>
    <AppContextProvider>
      <App />
    </AppContextProvider>
  </ThemeProvider>,
);
