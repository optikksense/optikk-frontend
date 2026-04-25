import { Link as LinkIcon } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

import type { SpanAttributes } from "../../../types";

/** OpenTelemetry span links UI (O13). Each link is clickable → navigates to the target trace. */
export function LinksTab({ attrs }: { attrs: SpanAttributes | null }) {
  const navigate = useNavigate();
  if (!attrs || !attrs.links || attrs.links.length === 0) {
    return <div className="p-4 text-center text-[12px] text-[var(--text-muted)]">No span links.</div>;
  }
  return (
    <div className="p-2">
      <p className="mb-2 px-1 text-[10px] uppercase tracking-wide text-[var(--text-muted)]">
        Producer/consumer or cross-trace references
      </p>
      <ul className="flex flex-col gap-1">
        {attrs.links.map((l, i) => (
          <li key={`${l.traceId}-${l.spanId}-${i}`}>
            <button
              type="button"
              onClick={() => navigate({ to: `/traces/${encodeURIComponent(l.traceId)}`, search: { span: l.spanId } as never })}
              className="flex w-full items-start gap-2 rounded border border-[var(--border-color)] px-2 py-2 text-left hover:bg-[var(--bg-secondary)]"
            >
              <LinkIcon size={14} className="mt-0.5 flex-shrink-0 text-[var(--text-muted)]" />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-mono text-[11px]">
                  <span className="text-[var(--text-muted)]">trace</span> {l.traceId.slice(0, 16)}…
                </span>
                <span className="truncate font-mono text-[10px] text-[var(--text-muted)]">
                  span {l.spanId.slice(0, 16)}…
                </span>
                {l.attributes && Object.keys(l.attributes).length > 0 ? (
                  <AttrsLine attrs={l.attributes} />
                ) : null}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AttrsLine({ attrs }: { attrs: Record<string, string> }) {
  const entries = Object.entries(attrs).slice(0, 4);
  return (
    <span className="mt-1 truncate font-mono text-[10px] text-[var(--text-secondary)]">
      {entries.map(([k, v]) => `${k}=${v}`).join(" · ")}
    </span>
  );
}
