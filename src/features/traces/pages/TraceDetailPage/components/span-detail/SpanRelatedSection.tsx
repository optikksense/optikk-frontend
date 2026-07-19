import { ExternalLink } from "lucide-react";
import { memo } from "react";

import { buildTraceDetailHref } from "@shared/observability/deepLinks";
import { formatDuration } from "@shared/utils/formatters";

import type { RelatedTrace, SpanLink } from "../../../../types";

interface Props {
  readonly links: readonly SpanLink[];
  readonly relatedTraces: readonly RelatedTrace[];
}

const row =
  "grid grid-cols-[10px_110px_1fr_auto] items-center gap-2 rounded-md border border-[var(--line-2)] bg-[var(--bg-card)] px-2.5 py-1.5 text-left text-[11.5px] hover:bg-[var(--bg-inset)]";

/** Span links + related traces (folded into the Info tab). */
function SpanRelatedSectionComponent({ links, relatedTraces }: Props) {
  if (links.length === 0 && relatedTraces.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {links.length > 0 && (
        <div className="flex flex-col gap-1">
          <div className="font-semibold text-[10.5px] text-[var(--fg-3)] uppercase tracking-[0.06em]">
            Span links ({links.length})
          </div>
          {links.map((link, i) => (
            <a
              key={`${link.traceId}-${link.spanId}-${i}`}
              href={buildTraceDetailHref(link.traceId, link.spanId)}
              className={row}
            >
              <span className="h-[7px] w-[7px] shrink-0 rounded-full bg-[var(--accent)]" />
              <span className="text-[var(--fg-2)]">trace</span>
              <span className="overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[var(--fg-0)]">
                {link.traceId.slice(0, 12)}… · span {link.spanId.slice(0, 8)}…
              </span>
              <ExternalLink size={11} className="text-[var(--fg-3)]" />
            </a>
          ))}
        </div>
      )}

      {relatedTraces.length > 0 && (
        <div className="flex flex-col gap-1">
          <div className="font-semibold text-[10.5px] text-[var(--fg-3)] uppercase tracking-[0.06em]">
            Related traces ({relatedTraces.length})
          </div>
          {relatedTraces.map((rt) => {
            return (
              <a
                key={`${rt.traceId}-${rt.spanId}`}
                href={buildTraceDetailHref(rt.traceId)}
                className={row}
              >
                <span className="h-[7px] w-[7px] shrink-0 rounded-full bg-[var(--accent)]" />
                <span className="text-[var(--fg-2)]">{rt.serviceName}</span>
                <span className="overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[var(--fg-0)]">
                  {rt.operationName}
                </span>
                <span className="font-mono text-[var(--fg-3)]">
                  {formatDuration(rt.durationMs)}
                </span>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

export const SpanRelatedSection = memo(SpanRelatedSectionComponent);
