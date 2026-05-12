import { ExternalLink } from "lucide-react";
import { memo } from "react";

import { formatDuration } from "@shared/utils/formatters";

import type { RelatedTrace, SpanLink } from "../../../../types";

interface Props {
  readonly links: readonly SpanLink[];
  readonly relatedTraces: readonly RelatedTrace[];
}

function LinksTabComponent({ links, relatedTraces }: Props) {
  const hasAny = links.length > 0 || relatedTraces.length > 0;
  if (!hasAny) {
    return (
      <div className="tdp-sd-pane">
        <div className="tdp-muted">No span links or related traces.</div>
      </div>
    );
  }

  return (
    <div className="tdp-sd-pane">
      {links.length > 0 && (
        <div className="tdp-sect">
          <div className="tdp-sect-h">
            <div className="tdp-sect-t">Span links ({links.length})</div>
          </div>
          <div className="tdp-ctx-list">
            {links.map((link, i) => (
              <a
                key={`${link.traceId}-${link.spanId}-${i}`}
                href={`/traces/${link.traceId}?span=${link.spanId}`}
                className="tdp-ctx-row"
              >
                <span className="tdp-svc-swatch-sm" />
                <span className="tdp-ctx-svc">trace</span>
                <span className="tdp-ctx-op">
                  {link.traceId.slice(0, 12)}… · span {link.spanId.slice(0, 8)}…
                </span>
                <ExternalLink size={11} />
              </a>
            ))}
          </div>
        </div>
      )}

      {relatedTraces.length > 0 && (
        <div className="tdp-sect">
          <div className="tdp-sect-h">
            <div className="tdp-sect-t">Related traces ({relatedTraces.length})</div>
          </div>
          <div className="tdp-ctx-list">
            {relatedTraces.map((rt) => (
              <a
                key={`${rt.traceId}-${rt.spanId}`}
                href={`/traces/${rt.traceId}`}
                className="tdp-ctx-row"
              >
                <span className="tdp-svc-swatch-sm" />
                <span className="tdp-ctx-svc">{rt.serviceName}</span>
                <span className="tdp-ctx-op">{rt.operationName}</span>
                <span className="tdp-ctx-dur">{formatDuration(rt.durationMs)}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export const LinksTab = memo(LinksTabComponent);
