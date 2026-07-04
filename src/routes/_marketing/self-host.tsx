import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const SelfHostPageLazy = lazy(() => import("@/features/marketing/pages/SelfHostPage/SelfHostPage"));

export const Route = createFileRoute("/_marketing/self-host")({
  component: () => (
      <SelfHostPageLazy />

  ),
});
