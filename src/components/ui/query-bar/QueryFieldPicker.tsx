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
        <div className="oqb__dropdown-header">
          <SlidersHorizontal size={12} />
          <span>Filter by field</span>
          <span className="oqb__dropdown-header-hint">
            {filtersLength > 0 ? `${filtersLength} active` : `${fieldsLength} fields`}
          </span>
        </div>
      )}

      {groups.map((group) => {
        const groupFields = filteredFields.filter((field) => (field.group || 'Other') === group);
        if (groupFields.length === 0) return null;

        return (
          <div key={group}>
            {groups.length > 1 && <div className="oqb__group-label">{group}</div>}
            {groupFields.map((field) => (
              <div
                key={field.key}
                className="oqb__dropdown-item"
                onClick={() => onPickField(field)}
              >
                <span className="oqb__dropdown-icon">{field.icon}</span>
                <span className="oqb__dropdown-name">{field.label}</span>
                <span className="oqb__dropdown-key">{field.key}</span>
                <ChevronRight size={12} className="oqb__dropdown-arrow" />
              </div>
            ))}
          </div>
        );
      })}

      {filteredFields.length === 0 && (
        <div className="oqb__dropdown-empty">No fields match "{fieldSearch}"</div>
      )}
    </>
  );
}
