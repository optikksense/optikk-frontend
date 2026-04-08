import type { ReactNode } from "react";

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
      <div className="flex items-center gap-1.5 border-border border-b px-3.5 pt-[10px] pb-2 text-[11px] text-muted-foreground tracking-[0.04em]">
        <span className="w-5 shrink-0 text-center text-[14px]">{pendingField.icon}</span>
        <strong>{pendingField.label}</strong>
        <span className="ml-1 text-muted-foreground">— select value</span>
      </div>
      {filteredHints.map((hint) => (
        <div
          key={hint}
          className="flex cursor-pointer items-center gap-2 px-3.5 py-[9px] text-[12.5px] transition-colors duration-100 first:rounded-t-[10px] last:rounded-b-[10px] hover:bg-[var(--color-primary-subtle-10)]"
          onClick={() => onPickValue(hint)}
        >
          <span className="flex-1 text-foreground">{hint}</span>
        </div>
      ))}
      {filteredHints.length === 0 && valueInput !== "" && (
        <div className="px-3.5 py-[18px] text-center text-muted-foreground text-xs">
          No suggestions match "{valueInput}"
        </div>
      )}
      {filteredHints.length === 0 && valueInput === "" && (
        <div className="px-3.5 py-[18px] text-center text-muted-foreground text-xs">
          No suggestions available
        </div>
      )}
    </>
  );
}
