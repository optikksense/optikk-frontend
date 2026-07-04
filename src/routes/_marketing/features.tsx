import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const FeaturesPageLazy = lazy(() => import("@/features/marketing/pages/FeaturesPage/FeaturesPage"));

export const Route = createFileRoute("/_marketing/features")({
  component: () => (
      <FeaturesPageLazy />

  ),
});
