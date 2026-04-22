import { memo } from "react";

interface Props {
  readonly method?: string;
  readonly httpStatus?: number;
}

const METHOD_COLORS: Readonly<Record<string, { bg: string; fg: string }>> = {
  GET: { bg: "bg-sky-500/15", fg: "text-sky-300" },
  POST: { bg: "bg-emerald-500/15", fg: "text-emerald-300" },
  PUT: { bg: "bg-amber-500/15", fg: "text-amber-300" },
  PATCH: { bg: "bg-amber-500/15", fg: "text-amber-300" },
  DELETE: { bg: "bg-red-500/15", fg: "text-red-300" },
  OPTIONS: { bg: "bg-slate-500/15", fg: "text-slate-300" },
  HEAD: { bg: "bg-slate-500/15", fg: "text-slate-300" },
};

function resolveColors(method: string): { bg: string; fg: string } {
  return METHOD_COLORS[method] ?? { bg: "bg-violet-500/15", fg: "text-violet-300" };
}

/**
 * HTTP method chip (GET/POST/PUT/DELETE/…). Shows status code inline when
 * provided so users can eyeball 5xx responses in the list view.
 */
export const TraceMethodBadge = memo(function TraceMethodBadge({ method, httpStatus }: Props) {
  if (!method) return null;
  const normalized = method.toUpperCase();
  const { bg, fg } = resolveColors(normalized);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${bg} ${fg}`}
    >
      <span>{normalized}</span>
      {typeof httpStatus === "number" ? (
        <span className="text-[10px] font-normal text-[var(--text-muted)]">{httpStatus}</span>
      ) : null}
    </span>
  );
});
