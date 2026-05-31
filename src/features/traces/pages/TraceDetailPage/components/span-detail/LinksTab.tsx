import { ExternalLink } from "lucide-react";
import { memo } from "react";

import { formatDuration } from "@shared/utils/formatters";

import type { RelatedTrace, SpanLink } from "../../../../types";

interface Props {
  readonly links: readonly SpanLink[];
  readonly relatedTraces: readonly RelatedTrace[];
}

const pane = "p-4 flex flex-col gap-4";
const sect = "flex flex-col gap-2";
const sectH = "flex items-center justify-between gap-2";
const sectT = "text-[10.5px] tracking-[0.06em] uppercase text-foreground-caption";
const ctxRow =
  "grid grid-cols-[10px_110px_1fr_auto] gap-2 px-2.5 py-1.5 items-center bg-background border border-border rounded-md text-[11.5px] text-left cursor-pointer hover:bg-muted";
const ctxSvc = "text-foreground-secondary";
const ctxOp = "text-foreground font-mono overflow-hidden text-ellipsis whitespace-nowrap";
const ctxDur = "text-foreground-muted font-mono";

function LinksTabComponent({ links, relatedTraces }: Props) {
  const hasAny = links.length > 0 || relatedTraces.length > 0;
  if (!hasAny) {
    return (
      <div className={pane}>
        <div className="py-2 text-[12px] text-foreground-caption">
          No span links or related traces.
        </div>
      </div>
    );
  }

  return (
    <div className={pane}>
      {links.length > 0 && (
        <div className={sect}>
          <div className={sectH}>
            <div className={sectT}>Span links ({links.length})</div>
          </div>
          <div className="flex flex-col gap-1">
            {links.map((link, i) => (
              <a
                key={`${link.traceId}-${link.spanId}-${i}`}
                href={`/traces/${link.traceId}?span=${link.spanId}`}
                className={ctxRow}
              >
                <span className="inline-block h-[7px] w-[7px] flex-none shrink-0 grow-0 basis-[7px] rounded-full bg-primary" />
                <span className={ctxSvc}>trace</span>
                <span className={ctxOp}>
                  {link.traceId.slice(0, 12)}… · span {link.spanId.slice(0, 8)}…
                </span>
                <ExternalLink size={11} />
              </a>
            ))}
          </div>
        </div>
      )}

      {relatedTraces.length > 0 && (
        <div className={sect}>
          <div className={sectH}>
            <div className={sectT}>Related traces ({relatedTraces.length})</div>
          </div>
          <div className="flex flex-col gap-1">
            {relatedTraces.map((rt) => (
              <a
                key={`${rt.traceId}-${rt.spanId}`}
                href={`/traces/${rt.traceId}`}
                className={ctxRow}
              >
                <span className="inline-block h-[7px] w-[7px] flex-none shrink-0 grow-0 basis-[7px] rounded-full bg-primary" />
                <span className={ctxSvc}>{rt.serviceName}</span>
                <span className={ctxOp}>{rt.operationName}</span>
                <span className={ctxDur}>{formatDuration(rt.durationMs)}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export const LinksTab = memo(LinksTabComponent);
