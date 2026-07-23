import { createFileRoute } from "@tanstack/react-router";

type TraceDetailSearch = {
  q?: string;
  err?: boolean;
  span?: string;
  from?: number;
  to?: number;
};

export const Route = createFileRoute("/_app/traces/$traceId")({
  validateSearch: (search: Record<string, unknown>): TraceDetailSearch => ({
    q: typeof search.q === "string" ? search.q : undefined,
    err: search.err === true || search.err === "true",
    span: typeof search.span === "string" ? search.span : undefined,
    from:
      typeof search.from === "number"
        ? search.from
        : typeof search.from === "string"
          ? Number(search.from) || undefined
          : undefined,
    to:
      typeof search.to === "number"
        ? search.to
        : typeof search.to === "string"
          ? Number(search.to) || undefined
          : undefined,
  }),
});
