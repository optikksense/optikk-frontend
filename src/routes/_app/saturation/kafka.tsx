import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const SaturationKafkaPage = lazy(
  () => import("@/features/saturation/pages/SaturationKafkaPage/SaturationKafkaPage")
);

export const Route = createFileRoute("/_app/saturation/kafka")({
  component: () => <SaturationKafkaPage />,
});
