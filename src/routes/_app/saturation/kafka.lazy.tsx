import { createLazyFileRoute } from "@tanstack/react-router";

import SaturationKafkaPage from "@/features/saturation/pages/SaturationKafkaPage";

export const Route = createLazyFileRoute("/_app/saturation/kafka")({
  component: () => <SaturationKafkaPage />,
});
