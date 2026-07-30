import { createLazyFileRoute } from "@tanstack/react-router";

import DatabaseDetailPage from "@/features/saturation/pages/SaturationDatabaseDetailPage/SaturationDatabaseDetailPage";

export const Route = createLazyFileRoute("/_app/database/instance/$system")({
  component: DatabaseDetailPage,
});
