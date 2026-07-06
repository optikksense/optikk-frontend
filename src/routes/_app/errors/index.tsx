import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const ErrorTrackingPage = lazy(() => import("@/features/errors/pages/ErrorTrackingPage"));

export const Route = createFileRoute("/_app/errors/")({
  component: () => <ErrorTrackingPage />,
});
