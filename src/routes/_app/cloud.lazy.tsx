import { createLazyFileRoute } from "@tanstack/react-router";

import CloudPage from "@/features/cloud/pages/CloudPage";

export const Route = createLazyFileRoute("/_app/cloud")({
  component: () => <CloudPage />,
});
