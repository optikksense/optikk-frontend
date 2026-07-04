import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const OpenTelemetryPageLazy = lazy(
  () => import("@/features/marketing/pages/OpenTelemetryPage/OpenTelemetryPage")
);

export const Route = createFileRoute("/_marketing/opentelemetry")({
  component: () => (
      <OpenTelemetryPageLazy />

  ),
});
