import { createLazyFileRoute } from "@tanstack/react-router";

import ErrorGroupDetailPage from "@/features/errors/pages/ErrorGroupDetailPage/ErrorGroupDetailPage";

export const Route = createLazyFileRoute("/_app/errors/$groupId")({
  component: () => <ErrorGroupDetailPage />,
});
