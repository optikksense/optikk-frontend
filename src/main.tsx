import React from "react";
import ReactDOM from "react-dom/client";

import { queryClient } from "@shared/api/queryClient";
import ErrorBoundary from "@shared/components/ui/feedback/ErrorBoundary";

import App from "./app/App";
import AppQueryClientProvider from "./app/providers/QueryClientProvider";
import ThemeProvider from "./app/providers/ThemeProvider";
import "./index.css";

export { queryClient };

const PRELOAD_RETRY_KEY = "optikk.preload-retry-at";
const PRELOAD_RETRY_WINDOW_MS = 60_000;

window.addEventListener("vite:preloadError", (event) => {
  try {
    const lastRetryAt = Number(sessionStorage.getItem(PRELOAD_RETRY_KEY));
    if (Number.isFinite(lastRetryAt) && Date.now() - lastRetryAt < PRELOAD_RETRY_WINDOW_MS) return;

    event.preventDefault();
    sessionStorage.setItem(PRELOAD_RETRY_KEY, String(Date.now()));
    window.location.reload();
  } catch {
    // Let Vite surface the original error when storage is unavailable.
  }
});

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element #root was not found");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <AppQueryClientProvider>
      <ThemeProvider>
        <ErrorBoundary showDetails={import.meta.env.DEV} boundaryName="root">
          <App />
        </ErrorBoundary>
      </ThemeProvider>
    </AppQueryClientProvider>
  </React.StrictMode>
);
