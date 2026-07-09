import { createLazyFileRoute } from "@tanstack/react-router";

import NotificationsPage from "@/features/monitors/pages/NotificationsPage/NotificationsPage";

export const Route = createLazyFileRoute("/_app/monitors/notifications")({
  component: () => <NotificationsPage />,
});
