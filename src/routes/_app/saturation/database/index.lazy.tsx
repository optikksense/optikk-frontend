import { createLazyFileRoute } from "@tanstack/react-router";

import SaturationDatabasePage from "@/features/saturation/pages/SaturationDatabasePage";

export const Route = createLazyFileRoute("/_app/saturation/database/")({
  component: () => <SaturationDatabasePage />,
});
