import { createLazyFileRoute } from "@tanstack/react-router";

import LogsExplorerPage from "@/features/logs/pages/LogsExplorerPage";

export const Route = createLazyFileRoute("/_app/logs/")({
  component: () => <LogsExplorerPage />,
});
