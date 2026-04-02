import { ReactNode } from 'react';

interface QueryField {
  key: string;
  label: string;
  icon?: ReactNode;
  group?: string;
}

interface QueryValuePickerProps {
  pendingField: QueryField;
  valueInput: string;
  hints: string[];
  onPickValue: (value: string) => void;
}

export default function QueryValuePicker({
  pendingField,
  valueInput,
  hints,
  onPickValue,
}: QueryValuePickerProps) {
  const filteredHints = hints.filter((h) => h.toLowerCase().includes(valueInput.toLowerCase()));

  return (
    <>
      <div className="flex items-center gap-1.5 px-3.5 pt-[10px] pb-2 text-[11px] text-muted-foreground border-b border-border tracking-[0.04em]">
        <span className="text-[14px] w-5 text-center shrink-0">{pendingField.icon}</span>
        <strong>{pendingField.label}</strong>
        <span className="text-muted-foreground ml-1">— select value</span>
      </div>
      {filteredHints.map((hint) => (
        <div
          key={hint}
          className="flex items-center gap-2 px-3.5 py-[9px] cursor-pointer text-[12.5px] transition-colors duration-100 hover:bg-[var(--color-primary-subtle-10)] first:rounded-t-[10px] last:rounded-b-[10px]"
          onClick={() => onPickValue(hint)}
        >
          <span className="text-foreground flex-1">{hint}</span>
        </div>
      ))}
      {filteredHints.length === 0 && valueInput !== '' && (
        <div className="px-3.5 py-[18px] text-muted-foreground text-xs text-center">
          No suggestions match "{valueInput}"
        </div>
      )}
      {filteredHints.length === 0 && valueInput === '' && (
        <div className="px-3.5 py-[18px] text-muted-foreground text-xs text-center">
          No suggestions available
        </div>
      )}
    </>
  );
}
