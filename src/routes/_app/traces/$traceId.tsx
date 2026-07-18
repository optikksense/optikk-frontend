import { createFileRoute } from "@tanstack/react-router";

type TraceDetailSearch = {
  startTime: number;
  endTime: number;
  q?: string;
  err?: boolean;
  span?: string;
};

export const Route = createFileRoute("/_app/traces/$traceId")({
  validateSearch: (search: Record<string, unknown>): TraceDetailSearch => {
    const startTime = Number(search.startTime);
    const endTime = Number(search.endTime);
    if (
      !Number.isFinite(startTime) ||
      !Number.isFinite(endTime) ||
      startTime <= 0 ||
      endTime <= 0 ||
      startTime >= endTime
    ) {
      throw new Error("Trace details require valid startTime and endTime query parameters");
    }
    return {
      startTime,
      endTime,
      q: typeof search.q === "string" ? search.q : undefined,
      err: search.err === true || search.err === "true",
      span: typeof search.span === "string" ? search.span : undefined,
    };
  },
});
