import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const DashboardsPage = lazy(
  () => import("@/features/dashboards/pages/DashboardsPage/DashboardsPage")
);

export const Route = createFileRoute("/_app/dashboards/")({
  component: () => <DashboardsPage />,
});
