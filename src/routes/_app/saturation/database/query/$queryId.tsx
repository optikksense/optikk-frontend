import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const SaturationDatabaseQueryPage = lazy(
  () => import("@/features/saturation/pages/SaturationDatabaseQueryPage")
);

export const Route = createFileRoute("/_app/saturation/database/query/$queryId")({
  component: () => <SaturationDatabaseQueryPage />,
});
