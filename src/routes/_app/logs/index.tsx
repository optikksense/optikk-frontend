import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const LogsExplorerPage = lazy(() => import("@/features/log/pages/LogsExplorerPage"));

export const Route = createFileRoute("/_app/logs/")({
  component: () => <LogsExplorerPage />,
});
