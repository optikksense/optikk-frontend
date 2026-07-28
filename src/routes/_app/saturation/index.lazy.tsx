import { createLazyFileRoute } from "@tanstack/react-router";

import SaturationPage from "@/features/saturation/pages/SaturationPage/SaturationPage";

export const Route = createLazyFileRoute("/_app/saturation/")({
  component: () => <SaturationPage />,
});
