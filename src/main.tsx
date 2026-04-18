import React from "react";
import ReactDOM from "react-dom/client";

import { queryClient } from "@shared/api/queryClient";
import { ErrorBoundary } from "@shared/components/ui/feedback";

import App from "./app/App";
import AppQueryClientProvider from "./app/providers/QueryClientProvider";
import ThemeProvider from "./app/providers/ThemeProvider";
import "./index.css";

export { queryClient };

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
