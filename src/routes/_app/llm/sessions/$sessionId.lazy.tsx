import { createLazyFileRoute } from "@tanstack/react-router";

import SessionDetailPage from "@/features/llm/pages/details/SessionDetailPage";

export const Route = createLazyFileRoute("/_app/llm/sessions/$sessionId")({
  component: () => <SessionDetailPage />,
});
