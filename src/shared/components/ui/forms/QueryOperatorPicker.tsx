import type { ReactNode } from "react";

interface QueryOperator {
  key: string;
  label: string;
  symbol: string;
}

interface QueryField {
  key: string;
  label: string;
  icon?: ReactNode;
  group?: string;
}

interface QueryOperatorPickerProps {
  pendingField: QueryField;
  operators: QueryOperator[];
  onPickOperator: (operator: QueryOperator) => void;
}

/**
 *
 * @param root0
 * @param root0.pendingField
 * @param root0.operators
 * @param root0.onPickOperator
 */
export default function QueryOperatorPicker({
  pendingField,
  operators,
  onPickOperator,
}: QueryOperatorPickerProps) {
  return (
    <>
      <div className="flex items-center gap-1.5 border-border border-b px-3.5 pt-[10px] pb-2 text-[11px] text-muted-foreground tracking-[0.04em]">
        <span className="w-5 shrink-0 text-center text-[14px]">{pendingField.icon}</span>
        <strong>{pendingField.label}</strong>
        <span className="ml-1 text-muted-foreground">— select operator</span>
      </div>
      {operators.map((operator) => (
        <div
          key={operator.key}
          className="flex cursor-pointer items-center gap-2 px-3.5 py-[9px] text-[12.5px] transition-colors duration-100 first:rounded-t-[10px] last:rounded-b-[10px] hover:bg-[var(--color-primary-subtle-10)]"
          onClick={() => onPickOperator(operator)}
        >
          <span className="w-7 shrink-0 text-center font-mono text-[14px] text-primary">
            {operator.symbol}
          </span>
          <span className="flex-1 text-foreground">{operator.label}</span>
        </div>
      ))}
    </>
  );
}
