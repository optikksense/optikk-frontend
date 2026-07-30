import { createLazyFileRoute } from "@tanstack/react-router";

import DatabaseExplorerPage from "@/features/saturation/pages/SaturationDatabasePage/SaturationDatabasePage";

export const Route = createLazyFileRoute("/_app/database/")({
  component: DatabaseExplorerPage,
});
