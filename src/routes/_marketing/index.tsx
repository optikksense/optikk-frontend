import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const HomePageLazy = lazy(() => import("@/features/marketing/pages/HomePage/HomePage"));

export const Route = createFileRoute("/_marketing/")({
  component: () => (
      <HomePageLazy />

  ),
});
