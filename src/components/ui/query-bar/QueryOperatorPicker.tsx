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
      <div className="oqb__dropdown-header">
        <span className="oqb__dropdown-icon">{pendingField.icon}</span>
        <strong>{pendingField.label}</strong>
        <span style={{ color: 'var(--text-muted)', marginLeft: 4 }}>
          — select operator
        </span>
      </div>
      {operators.map((operator) => (
        <div
          key={operator.key}
          className="oqb__dropdown-item"
          onClick={() => onPickOperator(operator)}
        >
          <span className="oqb__op-symbol">{operator.symbol}</span>
          <span className="oqb__dropdown-name">{operator.label}</span>
        </div>
      ))}
    </>
  );
}
