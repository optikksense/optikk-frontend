import { createLazyFileRoute } from "@tanstack/react-router";

import ContainerDetailPage from "@/features/infrastructure/pages/ContainerDetailPage";

export const Route = createLazyFileRoute("/_app/infrastructure/containers/$container")({
  component: () => <ContainerDetailPage />,
});
