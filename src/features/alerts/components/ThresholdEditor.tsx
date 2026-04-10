import { Input, Select } from "@/components/ui";

import type { AlertOperator } from "../types";

interface ThresholdEditorProps {
  readonly operator: AlertOperator;
  readonly warnThreshold: number | null;
  readonly criticalThreshold: number;
  readonly recoveryThreshold: number | null;
  readonly onChange: (patch: {
    operator?: AlertOperator;
    warnThreshold?: number | null;
    criticalThreshold?: number;
    recoveryThreshold?: number | null;
  }) => void;
}

const OPERATORS: Array<{ label: string; value: AlertOperator }> = [
  { label: ">", value: "gt" },
  { label: ">=", value: "gte" },
  { label: "<", value: "lt" },
  { label: "<=", value: "lte" },
  { label: "=", value: "eq" },
];

export function ThresholdEditor({
  operator,
  warnThreshold,
  criticalThreshold,
  recoveryThreshold,
  onChange,
}: ThresholdEditorProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <LabeledField label="Operator">
        <Select
          value={operator}
          onChange={(val) => onChange({ operator: val as AlertOperator })}
          options={OPERATORS}
          size="sm"
        />
      </LabeledField>
      <LabeledField label="Critical">
        <Input
          type="number"
          value={String(criticalThreshold)}
          onChange={(e) => onChange({ criticalThreshold: Number(e.target.value) })}
        />
      </LabeledField>
      <LabeledField label="Warn (optional)">
        <Input
          type="number"
          value={warnThreshold == null ? "" : String(warnThreshold)}
          onChange={(e) =>
            onChange({
              warnThreshold: e.target.value === "" ? null : Number(e.target.value),
            })
          }
        />
      </LabeledField>
      <LabeledField label="Recovery (optional)">
        <Input
          type="number"
          value={recoveryThreshold == null ? "" : String(recoveryThreshold)}
          onChange={(e) =>
            onChange({
              recoveryThreshold: e.target.value === "" ? null : Number(e.target.value),
            })
          }
        />
      </LabeledField>
    </div>
  );
}

function LabeledField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-[11px] text-[var(--text-muted)] uppercase tracking-[0.06em]">
      {label}
      <div className="text-[13px] normal-case tracking-normal text-[var(--text-primary)]">
        {children}
      </div>
    </label>
  );
}
