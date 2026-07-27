import { DrawerSection } from "@shared/components/ui/overlay/detail-drawer";
import type { RelatedTrace } from "@shared/traces/types/detail";
import { formatDuration } from "@shared/utils/formatters";
import { ArrowUpRight } from "lucide-react";
import { memo } from "react";

interface Props {
  readonly relatedTraces: readonly RelatedTrace[];
  readonly requested: boolean;
  readonly loading: boolean;
  readonly onLoad?: () => void;
}

function SpanRelatedSectionComponent({ relatedTraces, requested, loading, onLoad }: Props) {
  if (!requested && !onLoad) return null;

  return (
    <DrawerSection title={`Related Traces${requested ? ` (${relatedTraces.length})` : ""}`}>
      {!requested ? (
        <button
          type="button"
          onClick={onLoad}
          className="rounded border border-border px-2.5 py-1.5 text-[11px] hover:bg-secondary"
        >
          Load related traces
        </button>
      ) : loading ? (
        <div className="text-[11px] text-foreground-muted">Loading related traces…</div>
      ) : relatedTraces.length === 0 ? (
        <div className="text-[11px] text-foreground-muted">No related traces found.</div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {relatedTraces.map((r) => (
            <a
              key={r.traceId}
              href={`/traces/${r.traceId}`}
              className="flex items-center justify-between rounded-md border border-border bg-secondary p-2.5 font-mono text-[12px] hover:bg-muted"
            >
              <div className="flex items-center gap-2 truncate">
                <span className="text-foreground-muted">{r.serviceName}</span>
                <span className="text-foreground">{r.operationName}</span>
              </div>
              <div className="flex flex-none items-center gap-2 text-foreground-caption">
                <span>{formatDuration(r.durationMs)}</span>
                <ArrowUpRight size={13} />
              </div>
            </a>
          ))}
        </div>
      )}
    </DrawerSection>
  );
}

export const SpanRelatedSection = memo(SpanRelatedSectionComponent);
