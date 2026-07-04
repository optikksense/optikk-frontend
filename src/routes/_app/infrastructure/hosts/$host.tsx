import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const HostDetailPage = lazy(() => import("@/features/infrastructure/pages/HostDetailPage"));

export const Route = createFileRoute("/_app/infrastructure/hosts/$host")({
  component: () => (
        <HostDetailPage />

  ),
});
