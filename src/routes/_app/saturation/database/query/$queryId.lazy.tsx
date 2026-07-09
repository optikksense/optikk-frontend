import { createLazyFileRoute } from "@tanstack/react-router";

import SaturationDatabaseQueryPage from "@/features/saturation/pages/SaturationDatabaseQueryPage";

export const Route = createLazyFileRoute("/_app/saturation/database/query/$queryId")({
  component: () => <SaturationDatabaseQueryPage />,
});
