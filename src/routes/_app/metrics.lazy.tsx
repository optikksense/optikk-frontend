import { createLazyFileRoute } from "@tanstack/react-router";

import MetricsExplorerPage from "@/features/metrics/pages/MetricsExplorerPage/MetricsExplorerPage";

export const Route = createLazyFileRoute("/_app/metrics")({
  component: () => <MetricsExplorerPage />,
});
