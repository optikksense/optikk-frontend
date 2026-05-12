import { AlertCircle } from "lucide-react";
import { memo, useMemo } from "react";

import { formatDuration } from "@shared/utils/formatters";

import type { TraceRecord } from "@shared/entities/trace/model";

interface Props {
  readonly spans: readonly TraceRecord[];
  readonly onSelect: (span: { span_id: string }) => void;
}

function ErrorsTabComponent({ spans, onSelect }: Props) {
  const errs = useMemo(
    () => spans.filter((s) => (s.status ?? "").toUpperCase() === "ERROR"),
    [spans]
  );

  if (errs.length === 0) {
    return (
      <div className="tdp-ph">
        <div className="tdp-ph-t">No errored spans</div>
        <div className="tdp-ph-s">Every span in this trace finished with a non-error status.</div>
      </div>
    );
  }

  return (
    <div className="tdp-errs">
      <div className="tdp-errs-h">
        {errs.length} error span{errs.length === 1 ? "" : "s"} in this trace
      </div>
      {errs.map((s) => (
        <button
          key={s.span_id}
          type="button"
          className="tdp-err-card"
          onClick={() => onSelect({ span_id: s.span_id })}
        >
          <div className="tdp-err-card-h">
            <span className="tdp-sd-pill tdp-sd-pill-err">
              <AlertCircle size={11} /> error
            </span>
            <span className="tdp-err-card-svc">{s.service_name}</span>
            <span className="tdp-err-card-op">{s.operation_name}</span>
            <span className="tdp-err-card-t">{formatDuration(s.duration_ms ?? 0)}</span>
          </div>
          <div className="tdp-err-card-b">
            <div className="tdp-kv-grid">
              <div>
                <div className="tdp-kv-k">span kind</div>
                <div className="tdp-kv-v">{s.span_kind || "—"}</div>
              </div>
              <div>
                <div className="tdp-kv-k">http.status</div>
                <div className="tdp-kv-v">{s.http_status_code ?? "—"}</div>
              </div>
              {s.http_method && (
                <div>
                  <div className="tdp-kv-k">http.method</div>
                  <div className="tdp-kv-v">{s.http_method}</div>
                </div>
              )}
              {s.status_message && (
                <div>
                  <div className="tdp-kv-k">status_message</div>
                  <div className="tdp-kv-v">{s.status_message}</div>
                </div>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

export const ErrorsTab = memo(ErrorsTabComponent);
