import { Copy, Download } from "lucide-react";
import { memo, useCallback, useMemo } from "react";

import type { TraceRecord } from "@shared/entities/trace/model";

interface Props {
  readonly traceId: string;
  readonly spans: readonly TraceRecord[];
}

function RawJsonTabComponent({ traceId, spans }: Props) {
  const json = useMemo(
    () => JSON.stringify({ trace_id: traceId, spans }, null, 2),
    [traceId, spans]
  );

  const onDownload = useCallback(() => {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trace-${traceId.slice(0, 16)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [json, traceId]);

  const onCopy = useCallback(() => {
    void navigator.clipboard?.writeText(json);
  }, [json]);

  return (
    <div className="tdp-raw-wrap">
      <div className="tdp-raw-toolbar">
        <span className="tdp-muted">
          OpenTelemetry-style trace document · {spans.length} span{spans.length === 1 ? "" : "s"}
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          <button type="button" className="tdp-btn-sm tdp-btn-sm-ghost" onClick={onCopy}>
            <Copy size={12} /> Copy
          </button>
          <button type="button" className="tdp-btn-sm tdp-btn-sm-ghost" onClick={onDownload}>
            <Download size={12} /> Download .json
          </button>
        </div>
      </div>
      <pre className="tdp-raw-pre">{json}</pre>
    </div>
  );
}

export const RawJsonTab = memo(RawJsonTabComponent);
