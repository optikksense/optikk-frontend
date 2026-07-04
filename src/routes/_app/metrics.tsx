import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const MetricsExplorerPage = lazy(() => import("@/features/metrics/pages/MetricsExplorerPage"));

export const Route = createFileRoute("/_app/metrics")({
  component: () => (
        <MetricsExplorerPage />

  ),
});
