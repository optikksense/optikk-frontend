import { createLazyFileRoute } from "@tanstack/react-router";

import TraceDetailPage from "@/features/llm/pages/details/TraceDetailPage";

export const Route = createLazyFileRoute("/_app/llm/traces/$traceId")({
  component: () => <TraceDetailPage />,
});
