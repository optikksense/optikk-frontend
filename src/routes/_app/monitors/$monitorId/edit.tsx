import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const NewMonitorPage = lazy(() => import("@/features/monitors/pages/NewMonitorPage/NewMonitorPage"));

export const Route = createFileRoute("/_app/monitors/$monitorId/edit")({
  component: () => (
        <NewMonitorPage />

  ),
});
