import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const SecurityPageLazy = lazy(() => import("@/features/marketing/pages/SecurityPage/SecurityPage"));

export const Route = createFileRoute("/_marketing/security")({
  component: () => (
      <SecurityPageLazy />

  ),
});
