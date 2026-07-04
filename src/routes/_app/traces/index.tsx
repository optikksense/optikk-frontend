import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const TracesExplorerPage = lazy(() => import("@/features/traces/pages/TracesExplorerPage"));

export const Route = createFileRoute("/_app/traces/")({
  component: () => (
        <TracesExplorerPage />

  ),
});
