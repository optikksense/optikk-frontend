import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const InfrastructureHubPage = lazy(() => import("@/features/infrastructure/pages/InfrastructureHubPage"));

export const Route = createFileRoute("/_app/infrastructure")({
  component: () => (
        <InfrastructureHubPage />

  ),
});
