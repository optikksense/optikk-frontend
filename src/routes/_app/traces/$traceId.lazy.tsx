import { createLazyFileRoute } from "@tanstack/react-router";

import TraceDetailPage from "@/features/traces/pages/TraceDetailPage/TraceDetailPage";

export const Route = createLazyFileRoute("/_app/traces/$traceId")({
  component: () => <TraceDetailPage />,
});
