import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const SaturationDatabaseDetailPage = lazy(() => import("@/features/saturation/pages/SaturationDatabaseDetailPage/SaturationDatabaseDetailPage"));

export const Route = createFileRoute("/_app/saturation/database/instance/$system")({
  component: () => (
        <SaturationDatabaseDetailPage />

  ),
});
