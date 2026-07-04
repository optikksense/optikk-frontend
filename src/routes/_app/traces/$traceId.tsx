import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const TraceDetailPage = lazy(() => import("@/features/traces/pages/TraceDetailPage"));

type TraceDetailSearch = {
  q?: string;
  err?: boolean;
  span?: string;
};

export const Route = createFileRoute("/_app/traces/$traceId")({
  validateSearch: (search: Record<string, unknown>): TraceDetailSearch => {
    return {
      q: typeof search.q === "string" ? search.q : undefined,
      err: search.err === true || search.err === "true",
      span: typeof search.span === "string" ? search.span : undefined,
    };
  },
  component: () => <TraceDetailPage />,
});
