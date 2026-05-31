import type { CreateMonitorPayload, LogQueryShape } from "../../../api/monitorsApi";

import FieldRow from "./FieldRow";

interface Props {
  readonly draft: CreateMonitorPayload;
  readonly setDraft: (fn: (prev: CreateMonitorPayload) => CreateMonitorPayload) => void;
}

const GROUPS = ["service", "host", "status", "none"];
const WINDOWS = [60, 300, 900, 3600];

export default function LogQuery({ draft, setDraft }: Props) {
  const q: LogQueryShape = draft.query.log ?? {
    query: "",
    group_by: "service",
    window_sec: 300,
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
      <FieldRow label="Group by">
        <div className="flex items-center gap-1.5">
          {GROUPS.map((g) => {
            const active = q.group_by === g;
            return (
              <button
                key={g}
                type="button"
                onClick={() => update({ group_by: g })}
                className={`rounded px-2 py-0.5 font-mono text-xs ${
                  active ? "bg-primary text-white" : "bg-secondary text-foreground-secondary"
                }`}
              >
                {g}
              </button>
            );
          })}
        </div>
      </FieldRow>
      <FieldRow label="Window">
        <div className="flex items-center gap-1.5">
          {WINDOWS.map((w) => {
            const active = q.window_sec === w;
            return (
              <button
                key={w}
                type="button"
                onClick={() => update({ window_sec: w })}
                className={`rounded px-2 py-0.5 font-mono text-xs ${
                  active ? "bg-primary text-white" : "bg-secondary text-foreground-secondary"
                }`}
              >
                {w >= 3600 ? `${w / 3600}h` : `${w / 60}m`}
              </button>
            );
          })}
        </div>
      </FieldRow>
    </>
  );
}
