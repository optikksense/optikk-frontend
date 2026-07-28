import { createLazyFileRoute } from "@tanstack/react-router";

import HostDetailPage from "@/features/infrastructure/pages/HostDetailPage/HostDetailPage";

export const Route = createLazyFileRoute("/_app/infrastructure/hosts/$host")({
  component: () => <HostDetailPage />,
});
