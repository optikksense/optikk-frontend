import { Search } from "lucide-react";
import type { ReactNode } from "react";

interface FilterSearchConfig {
  type: "search";
  key: string;
  placeholder?: string;
  onSearch?: (value: string) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  width?: number;
}

interface FilterSelectConfig {
  type: "select";
  key: string;
  placeholder?: string;
  options?: Array<{ label: string; value: string | number }>;
  value?: string | number;
  onChange?: (value: string | number | null) => void;
  width?: number;
  allowClear?: boolean;
}

type FilterConfig = FilterSearchConfig | FilterSelectConfig;

interface FilterBarProps {
  filters?: FilterConfig[];
  actions?: ReactNode;
}

/**
 *
 * @param root0
 * @param root0.filters
 * @param root0.actions
 */
export default function FilterBar({ filters = [], actions }: FilterBarProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((filter) => {
          if (filter.type === "search") {
            return (
              <div
                key={filter.key}
                className="relative inline-flex items-center"
                style={{ width: filter.width || 300 }}
              >
                <Search
                  size={16}
                  className="pointer-events-none absolute left-2 text-[color:var(--text-secondary,#999)]"
                />
                <input
                  type="text"
                  placeholder={filter.placeholder || "Search..."}
                  value={filter.value ?? ""}
                  onChange={(e) => {
                    filter.onChange?.(e);
                    filter.onSearch?.(e.target.value);
                  }}
                  className="h-8 w-full rounded-md border border-border pl-[30px] text-sm"
                />
              </div>
            );
          }

          if (filter.type === "select") {
            return (
              <select
                key={filter.key}
                value={filter.value ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  filter.onChange?.(
                    val === "" ? null : Number.isNaN(Number(val)) ? val : Number(val)
                  );
                }}
                className="h-8 rounded-md border border-border px-2 text-sm"
                style={{ width: filter.width || 160 }}
              >
                {filter.placeholder && <option value="">{filter.placeholder}</option>}
                {filter.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            );
          }

          return null;
        })}
      </div>

      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
