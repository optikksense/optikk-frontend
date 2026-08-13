import type { CreateMonitorPayload, LogQueryShape } from "../../../api/monitorsApi";
import { EVAL_WINDOWS, formatWindowLabel } from "../../../constants";

import FieldRow from "./FieldRow";

interface Props {
  readonly draft: CreateMonitorPayload;
  readonly setDraft: (fn: (prev: CreateMonitorPayload) => CreateMonitorPayload) => void;
}

export default function LogQuery({ draft, setDraft }: Props) {
  const q: LogQueryShape = draft.query.log ?? {
    query: "",
    windowSec: 300,
  };

  const update = (patch: Partial<LogQueryShape>) =>
    setDraft((prev) => ({
      ...prev,
      query: { log: { ...q, ...patch } },
    }));

  return (
    <>
      <FieldRow label="Log query">
        <textarea
          value={q.query}
          onChange={(e) => update({ query: e.target.value })}
          rows={2}
          placeholder="e.g. @level:error service:payment-svc"
          className="w-full rounded border border-border bg-card px-2.5 py-1.5 font-mono text-xs"
        />
      </FieldRow>
      <FieldRow label="Window">
        <div className="flex items-center gap-1.5">
          {EVAL_WINDOWS.map((w) => {
            const active = q.windowSec === w;
            return (
              <button
                key={w}
                type="button"
                onClick={() => update({ windowSec: w })}
                className={`rounded px-2 py-0.5 font-mono text-xs ${
                  active ? "bg-primary text-white" : "bg-secondary text-foreground-secondary"
                }`}
              >
                {formatWindowLabel(w)}
              </button>
            );
          })}
        </div>
      </FieldRow>
    </>
  );
}
