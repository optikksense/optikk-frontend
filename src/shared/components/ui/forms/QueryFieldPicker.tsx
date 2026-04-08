import { ChevronRight, SlidersHorizontal } from "lucide-react";
import type { ReactNode } from "react";

interface QueryField {
  key: string;
  label: string;
  icon?: ReactNode;
  group?: string;
}

interface QueryFieldPickerProps {
  fieldSearch: string;
  filtersLength: number;
  fieldsLength: number;
  groups: string[];
  filteredFields: QueryField[];
  onPickField: (field: QueryField) => void;
}

/**
 *
 * @param root0
 * @param root0.fieldSearch
 * @param root0.filtersLength
 * @param root0.fieldsLength
 * @param root0.groups
 * @param root0.filteredFields
 * @param root0.onPickField
 */
export default function QueryFieldPicker({
  fieldSearch,
  filtersLength,
  fieldsLength,
  groups,
  filteredFields,
  onPickField,
}: QueryFieldPickerProps) {
  return (
    <>
      {fieldSearch === "" && (
        <div className="flex items-center gap-1.5 border-border border-b px-3.5 pt-[10px] pb-2 text-[11px] text-muted-foreground tracking-[0.04em]">
          <SlidersHorizontal size={12} />
          <span>Filter by field</span>
          <span className="ml-auto rounded-[10px] border border-border bg-secondary px-[7px] py-[1px] text-[10px] text-muted-foreground">
            {filtersLength > 0 ? `${filtersLength} active` : `${fieldsLength} fields`}
          </span>
        </div>
      )}

      {groups.map((group) => {
        const groupFields = filteredFields.filter((field) => (field.group || "Other") === group);
        if (groupFields.length === 0) return null;

        return (
          <div key={group}>
            {groups.length > 1 && (
              <div className="px-3.5 pt-2 pb-1 font-bold text-[10px] text-muted-foreground uppercase tracking-[0.08em]">
                {group}
              </div>
            )}
            {groupFields.map((field) => (
              <div
                key={field.key}
                className="group flex cursor-pointer items-center gap-2 px-3.5 py-[9px] text-[12.5px] transition-colors duration-100 first:rounded-t-[10px] last:rounded-b-[10px] hover:bg-[var(--color-primary-subtle-10)]"
                onClick={() => onPickField(field)}
              >
                <span className="w-5 shrink-0 text-center text-[14px]">{field.icon}</span>
                <span className="flex-1 text-foreground">{field.label}</span>
                <span className="font-mono text-[10.5px] text-muted-foreground">{field.key}</span>
                <ChevronRight
                  size={12}
                  className="text-muted-foreground opacity-0 transition-all duration-100 group-hover:translate-x-0.5 group-hover:opacity-100"
                />
              </div>
            ))}
          </div>
        );
      })}

      {filteredFields.length === 0 && (
        <div className="px-3.5 py-[18px] text-center text-muted-foreground text-xs">
          No fields match "{fieldSearch}"
        </div>
      )}
    </>
  );
}
