import { memo } from "react";

interface Props {
  readonly status: string;
  readonly hasError?: boolean;
}

function classify(status: string, hasError: boolean): {
  label: string;
  bg: string;
  fg: string;
} {
  const upper = status.toUpperCase();
  if (hasError || upper === "ERROR") {
    return { label: "Error", bg: "bg-red-500/20", fg: "text-red-300" };
  }
  if (upper === "UNSET" || upper === "") {
    return { label: "Unset", bg: "bg-yellow-500/20", fg: "text-yellow-300" };
  }
  if (upper === "OK") {
    return { label: "OK", bg: "bg-emerald-500/20", fg: "text-emerald-300" };
  }
  return { label: upper || "OK", bg: "bg-slate-500/20", fg: "text-slate-300" };
}

/**
 * Trace status pill — green (OK), red (Error), yellow (Unset).
 * Also drives the `hasError` signal coming from `traces_index`.
 */
export const TraceStatusBadge = memo(function TraceStatusBadge({ status, hasError = false }: Props) {
  const { label, bg, fg } = classify(status, hasError);
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium ${bg} ${fg}`}
    >
      {label}
    </span>
  );
});
