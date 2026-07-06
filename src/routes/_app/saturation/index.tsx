import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const SaturationPage = lazy(() => import("@/features/saturation/pages/SaturationPage"));

export const Route = createFileRoute("/_app/saturation/")({
  component: () => <SaturationPage />,
});
