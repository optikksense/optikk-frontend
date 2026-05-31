import type { CreateMonitorPayload, MonitorPriority } from "../../api/monitorsApi";

import StepShell from "./StepShell";
import FieldRow from "./queryForms/FieldRow";

interface Props {
  readonly draft: CreateMonitorPayload;
  readonly setDraft: (fn: (prev: CreateMonitorPayload) => CreateMonitorPayload) => void;
}

const PRIORITIES: { id: MonitorPriority; label: string; color: string }[] = [
  { id: "P1", label: "P1 · page", color: "text-error border-error" },
  { id: "P2", label: "P2 · ticket", color: "text-warning border-warning" },
  { id: "P3", label: "P3 · notify", color: "text-foreground-secondary border-border" },
  { id: "P4", label: "P4 · info", color: "text-foreground-secondary border-border" },
];

export default function WizardDefineStep({ draft, setDraft }: Props) {
  return (
    <StepShell n={5} title="Name & tag" sub="Make it easy to find and route">
      <FieldRow label="Monitor name">
        <input
          value={draft.name}
          onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
          placeholder="e.g. Error rate spike · payment-svc"
          className="w-full rounded border border-border bg-card px-2.5 py-1.5 text-sm"
        />
      </FieldRow>
      <FieldRow label="Priority">
        <div className="flex items-center gap-1.5">
          {PRIORITIES.map((p) => {
            const active = draft.priority === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setDraft((d) => ({ ...d, priority: p.id }))}
                className={`rounded border px-3 py-1 font-medium text-xs ${
                  active ? `${p.color} bg-secondary` : "border-border text-foreground-secondary"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </FieldRow>
      <FieldRow label="Tags (comma-separated)">
        <input
          value={(draft.tags ?? []).join(", ")}
          onChange={(e) =>
            setDraft((p) => ({
              ...p,
              tags: e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            }))
          }
          placeholder="team:payments, tier:0"
          className="w-full rounded border border-border bg-card px-2.5 py-1.5 font-mono text-xs"
        />
      </FieldRow>
      <FieldRow label="Runbook URL">
        <input
          value={draft.runbook_url ?? ""}
          onChange={(e) => setDraft((p) => ({ ...p, runbook_url: e.target.value }))}
          placeholder="https://…"
          className="w-full rounded border border-border bg-card px-2.5 py-1.5 font-mono text-xs"
        />
      </FieldRow>
      <FieldRow label="Eval every">
        <div className="flex items-center gap-1.5">
          {[60, 300, 900, 3600].map((sec) => {
            const active = draft.eval_every_sec === sec;
            return (
              <button
                key={sec}
                type="button"
                onClick={() => setDraft((d) => ({ ...d, eval_every_sec: sec }))}
                className={`rounded px-2 py-0.5 text-xs ${
                  active ? "bg-primary text-white" : "bg-secondary text-foreground-secondary"
                }`}
              >
                {sec >= 3600 ? `${sec / 3600}h` : `${sec / 60}m`}
              </button>
            );
          })}
        </div>
      </FieldRow>
    </StepShell>
  );
}
