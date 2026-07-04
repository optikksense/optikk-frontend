import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const MarketingLayout = lazy(() => import("@/features/marketing/MarketingLayout"));

export const Route = createFileRoute("/_marketing")({
  component: () => (
      <MarketingLayout />

  ),
});
