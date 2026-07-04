import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const MonitorsPage = lazy(() => import("@/features/monitors/pages/MonitorsPage/MonitorsPage"));

export const Route = createFileRoute("/_app/monitors/")({
  component: () => (
        <MonitorsPage />

  ),
});
