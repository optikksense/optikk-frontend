import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const PrivacyPolicyPageLazy = lazy(
  () => import("@/features/marketing/pages/PrivacyPolicyPage/PrivacyPolicyPage")
);

export const Route = createFileRoute("/_marketing/privacy")({
  component: () => (
      <PrivacyPolicyPageLazy />

  ),
});
