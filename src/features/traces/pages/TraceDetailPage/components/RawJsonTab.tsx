import { Copy, Download } from "lucide-react";
import { memo, useCallback, useMemo } from "react";

import type { TraceRecord } from "@shared/entities/trace/model";

interface Props {
  readonly traceId: string;
  readonly spans: readonly TraceRecord[];
}

const btnSmGhost =
  "px-2.5 py-[5px] text-[11.5px] rounded-[5px] bg-transparent text-foreground-muted border border-transparent cursor-pointer hover:bg-muted hover:text-foreground";

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
    <div className="p-4 flex flex-col gap-2 min-h-0 flex-1">
      <div className="flex items-center justify-between gap-2">
        <span className="text-foreground-caption text-[12px] py-2">
          OpenTelemetry-style trace document · {spans.length} span{spans.length === 1 ? "" : "s"}
        </span>
        <div className="flex gap-1.5">
          <button type="button" className={btnSmGhost} onClick={onCopy}>
            <Copy size={12} /> Copy
          </button>
          <button type="button" className={btnSmGhost} onClick={onDownload}>
            <Download size={12} /> Download .json
          </button>
        </div>
      </div>
      <pre className="m-0 p-3 bg-secondary border border-border rounded-md font-mono text-[11.5px] text-foreground-secondary overflow-auto flex-1 min-h-0 whitespace-pre">
        {json}
      </pre>
    </div>
  );
}

export const RawJsonTab = memo(RawJsonTabComponent);
