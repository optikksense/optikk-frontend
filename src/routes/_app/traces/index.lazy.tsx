import { createLazyFileRoute } from "@tanstack/react-router";

import TracesExplorerPage from "@/features/traces/pages/TracesExplorerPage/TracesExplorerPage";

export const Route = createLazyFileRoute("/_app/traces/")({
  component: () => <TracesExplorerPage />,
});
