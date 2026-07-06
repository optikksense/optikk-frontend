import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const MonitorDetailPage = lazy(
  () => import("@/features/monitors/pages/MonitorDetailPage/MonitorDetailPage")
);

export const Route = createFileRoute("/_app/monitors/$monitorId")({
  component: () => <MonitorDetailPage />,
});
