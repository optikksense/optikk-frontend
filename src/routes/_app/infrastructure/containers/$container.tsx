import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const ContainerDetailPage = lazy(
  () => import("@/features/infrastructure/pages/ContainerDetailPage")
);

export const Route = createFileRoute("/_app/infrastructure/containers/$container")({
  component: () => <ContainerDetailPage />,
});
