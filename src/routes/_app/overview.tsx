import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const OverviewHubPage = lazy(() => import("@/features/overview/pages/OverviewHubPage"));

export const Route = createFileRoute("/_app/overview")({
  component: () => <OverviewHubPage />,
});
