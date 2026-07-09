import { createLazyFileRoute } from "@tanstack/react-router";

import MonitorsPage from "@/features/monitors/pages/MonitorsPage/MonitorsPage";

export const Route = createLazyFileRoute("/_app/monitors/")({
  component: () => <MonitorsPage />,
});
