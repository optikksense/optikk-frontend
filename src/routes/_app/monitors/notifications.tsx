import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const NotificationsPage = lazy(
  () => import("@/features/monitors/pages/NotificationsPage/NotificationsPage")
);

export const Route = createFileRoute("/_app/monitors/notifications")({
  component: () => <NotificationsPage />,
});
