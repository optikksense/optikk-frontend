import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const TermsOfServicePageLazy = lazy(
  () => import("@/features/marketing/pages/TermsOfServicePage/TermsOfServicePage")
);

export const Route = createFileRoute("/_marketing/terms")({
  component: () => (
      <TermsOfServicePageLazy />

  ),
});
