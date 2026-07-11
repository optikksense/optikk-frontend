import { createLazyFileRoute } from "@tanstack/react-router";

import SaturationDatabaseDetailPage from "@/features/saturation/pages/SaturationDatabaseDetailPage";

export const Route = createLazyFileRoute("/_app/saturation/database/instance/$system")({
  component: () => <SaturationDatabaseDetailPage />,
});
