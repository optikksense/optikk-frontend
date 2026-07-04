import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const SaturationDatabasePage = lazy(() => import("@/features/saturation/pages/SaturationDatabasePage/SaturationDatabasePage"));

export const Route = createFileRoute("/_app/saturation/database/")({
  component: () => (
        <SaturationDatabasePage />

  ),
});
