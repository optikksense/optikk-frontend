import type { APMQueryShape, CreateMonitorPayload } from "../../../api/monitorsApi";

import FieldRow from "./FieldRow";

interface Props {
  readonly draft: CreateMonitorPayload;
  readonly setDraft: (fn: (prev: CreateMonitorPayload) => CreateMonitorPayload) => void;
}

const TRACKS: { id: string; label: string; unit: string; desc: string }[] = [
  { id: "errors", label: "Error rate", unit: "%", desc: "5xx + exception spans" },
  { id: "hits", label: "Throughput", unit: "rps", desc: "request count per second" },
  { id: "latency", label: "Latency", unit: "ms", desc: "p99 percentile" },
  { id: "apdex", label: "Apdex", unit: "0–1", desc: "satisfaction score" },
];

const WINDOWS = [60, 300, 900, 3600];

export default function APMQuery({ draft, setDraft }: Props) {
  const q: APMQueryShape = draft.query.apm ?? {
    service: "",
    track: "errors",
    window_sec: 300,
  };

  const update = (patch: Partial<APMQueryShape>) =>
    setDraft((prev) => ({
      ...prev,
      query: { apm: { ...q, ...patch } },
    }));

  return (
    <>
      <FieldRow label="Service">
        <input
          value={q.service}
          onChange={(e) => update({ service: e.target.value })}
          placeholder="e.g. payment-svc"
          className="w-72 rounded border border-border bg-card px-2.5 py-1.5 font-mono text-xs"
        />
      </FieldRow>
      <FieldRow label="Resource">
        <input
          value={q.resource ?? ""}
          onChange={(e) => update({ resource: e.target.value })}
          placeholder="(any resource)"
          className="w-full rounded border border-border bg-card px-2.5 py-1.5 font-mono text-xs"
        />
      </FieldRow>
      <FieldRow label="Track">
        <div className="grid grid-cols-4 gap-2">
          {TRACKS.map((t) => {
            const active = q.track === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => update({ track: t.id })}
                className={`rounded border p-2 text-left transition-colors ${
                  active
                    ? "border-primary bg-secondary"
                    : "border-border hover:border-foreground-muted"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-xs">{t.label}</span>
                  <span className="font-mono text-[10px] text-foreground-muted">{t.unit}</span>
                </div>
                <div className="mt-0.5 text-[10px] text-foreground-muted">{t.desc}</div>
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
                  active
                    ? "bg-primary text-white"
                    : "bg-secondary text-foreground-secondary hover:text-foreground"
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
