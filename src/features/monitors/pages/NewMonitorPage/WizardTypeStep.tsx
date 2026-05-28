import { Activity, Clipboard, FileText, Zap } from "lucide-react";

import type { MonitorType } from "../../api/monitorsApi";

import StepShell from "./StepShell";

interface Props {
  readonly value: MonitorType;
  readonly onChange: (t: MonitorType) => void;
}

const TYPES: { id: MonitorType; label: string; desc: string; Icon: typeof Activity; color: string }[] = [
  {
    id: "metric",
    label: "Metric Alert",
    desc: "Alert on metric value or rate change",
    Icon: Clipboard,
    color: "border-blue-500 text-blue-500",
  },
  {
    id: "apm",
    label: "APM",
    desc: "Service errors, latency, throughput",
    Icon: Activity,
    color: "border-violet-500 text-violet-500",
  },
  {
    id: "log",
    label: "Log",
    desc: "Match against log content or count by query",
    Icon: FileText,
    color: "border-amber-500 text-amber-500",
  },
];

export default function WizardTypeStep({ value, onChange }: Props) {
  return (
    <StepShell n={1} title="Choose a type" sub="What signal triggers this monitor?">
      <div className="grid grid-cols-3 gap-3">
        {TYPES.map((t) => {
          const active = t.id === value;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange(t.id)}
              className={`flex flex-col items-start gap-2 rounded border-2 p-4 text-left transition-colors ${
                active
                  ? `${t.color} bg-[var(--bg-secondary)]`
                  : "border-[var(--border-color)] bg-[var(--bg-card)] hover:border-[var(--text-muted)]"
              }`}
            >
              <div className="flex items-center gap-2">
                <t.Icon size={16} />
                <span className="text-sm font-medium">{t.label}</span>
              </div>
              <div className="text-[11px] text-[var(--text-muted)]">{t.desc}</div>
            </button>
          );
        })}
        <div className="flex items-center justify-center rounded border border-dashed border-[var(--border-color)] p-4 text-center text-[11px] text-[var(--text-muted)]">
          <div>
            <Zap size={14} className="mx-auto mb-1" />
            Anomaly: coming soon
          </div>
        </div>
      </div>
    </StepShell>
  );
}
