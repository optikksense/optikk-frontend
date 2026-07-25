import { DrawerSection } from "@shared/components/ui/overlay/detail-drawer";
import type { RelatedTrace } from "@shared/traces/types/detail";
import { formatDuration } from "@shared/utils/formatters";
import { ArrowUpRight } from "lucide-react";
import { memo } from "react";

interface Props {
  readonly relatedTraces: readonly RelatedTrace[];
}

function SpanRelatedSectionComponent({ relatedTraces }: Props) {
  if (relatedTraces.length === 0) return null;

  return (
    <DrawerSection title={`Related Traces (${relatedTraces.length})`}>
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
    </DrawerSection>
  );
}

export const SpanRelatedSection = memo(SpanRelatedSectionComponent);
