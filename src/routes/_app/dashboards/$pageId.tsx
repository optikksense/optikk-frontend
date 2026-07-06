import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const DashboardDetailPage = lazy(
  () => import("@/features/dashboards/pages/DashboardDetailPage/DashboardDetailPage")
);

export const Route = createFileRoute("/_app/dashboards/$pageId")({
  component: () => <DashboardDetailPage />,
});
