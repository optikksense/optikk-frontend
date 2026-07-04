import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const ArchitecturePageLazy = lazy(
  () => import("@/features/marketing/pages/ArchitecturePage/ArchitecturePage")
);

export const Route = createFileRoute("/_marketing/architecture")({
  component: () => (
      <ArchitecturePageLazy />

  ),
});
