import { ChevronRight, SlidersHorizontal } from 'lucide-react';
import { ReactNode } from 'react';

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
      {fieldSearch === '' && (
        <div className="flex items-center gap-1.5 px-3.5 pt-[10px] pb-2 text-[11px] text-muted-foreground border-b border-border tracking-[0.04em]">
          <SlidersHorizontal size={12} />
          <span>Filter by field</span>
          <span className="ml-auto text-[10px] bg-secondary px-[7px] py-[1px] rounded-[10px] border border-border text-muted-foreground">
            {filtersLength > 0 ? `${filtersLength} active` : `${fieldsLength} fields`}
          </span>
        </div>
      )}

      {groups.map((group) => {
        const groupFields = filteredFields.filter((field) => (field.group || 'Other') === group);
        if (groupFields.length === 0) return null;

        return (
          <div key={group}>
            {groups.length > 1 && (
              <div className="px-3.5 pt-2 pb-1 text-[10px] font-bold tracking-[0.08em] uppercase text-muted-foreground">
                {group}
              </div>
            )}
            {groupFields.map((field) => (
              <div
                key={field.key}
                className="group flex items-center gap-2 px-3.5 py-[9px] cursor-pointer text-[12.5px] transition-colors duration-100 hover:bg-[var(--color-primary-subtle-10)] first:rounded-t-[10px] last:rounded-b-[10px]"
                onClick={() => onPickField(field)}
              >
                <span className="text-[14px] w-5 text-center shrink-0">{field.icon}</span>
                <span className="text-foreground flex-1">{field.label}</span>
                <span className="text-muted-foreground text-[10.5px] font-mono">{field.key}</span>
                <ChevronRight
                  size={12}
                  className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-all duration-100 group-hover:translate-x-0.5"
                />
              </div>
            ))}
          </div>
        );
      })}

      {filteredFields.length === 0 && (
        <div className="px-3.5 py-[18px] text-muted-foreground text-xs text-center">
          No fields match "{fieldSearch}"
        </div>
      )}
    </>
  );
}
