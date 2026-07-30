import { createLazyFileRoute } from "@tanstack/react-router";

import DatabaseQueryPage from "@/features/saturation/pages/SaturationDatabaseQueryPage/SaturationDatabaseQueryPage";

export const Route = createLazyFileRoute("/_app/database/query/$queryId")({
  component: DatabaseQueryPage,
});
