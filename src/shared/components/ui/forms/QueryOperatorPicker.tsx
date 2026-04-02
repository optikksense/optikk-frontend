import { ReactNode } from 'react';

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
      <div className="flex items-center gap-1.5 px-3.5 pt-[10px] pb-2 text-[11px] text-muted-foreground border-b border-border tracking-[0.04em]">
        <span className="text-[14px] w-5 text-center shrink-0">{pendingField.icon}</span>
        <strong>{pendingField.label}</strong>
        <span className="text-muted-foreground ml-1">— select operator</span>
      </div>
      {operators.map((operator) => (
        <div
          key={operator.key}
          className="flex items-center gap-2 px-3.5 py-[9px] cursor-pointer text-[12.5px] transition-colors duration-100 hover:bg-[var(--color-primary-subtle-10)] first:rounded-t-[10px] last:rounded-b-[10px]"
          onClick={() => onPickOperator(operator)}
        >
          <span className="font-mono text-primary text-[14px] w-7 text-center shrink-0">
            {operator.symbol}
          </span>
          <span className="text-foreground flex-1">{operator.label}</span>
        </div>
      ))}
    </>
  );
}
