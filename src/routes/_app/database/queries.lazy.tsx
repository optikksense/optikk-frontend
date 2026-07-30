import { createLazyFileRoute } from "@tanstack/react-router";

import DatabaseQueriesPage from "@/features/saturation/pages/SaturationDatabaseQueriesPage/SaturationDatabaseQueriesPage";

export const Route = createLazyFileRoute("/_app/database/queries")({
  component: DatabaseQueriesPage,
});
