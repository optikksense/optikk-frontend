import { cn } from "@/lib/utils";
import { Keyboard, Plus, Search, X } from "lucide-react";
import type { ReactNode } from "react";

import QueryFieldPicker from "./QueryFieldPicker";
import QueryKeyboardHints from "./QueryKeyboardHints";
import QueryOperatorPicker from "./QueryOperatorPicker";
import QueryValuePicker from "./QueryValuePicker";
import {
  EXPLORER_QUERY_DROPDOWN_CLASSNAME,
  EXPLORER_QUERY_ICON_CLASSNAME,
  EXPLORER_QUERY_INNER_ROW_CLASSNAME,
  EXPLORER_QUERY_SURFACE_CLASSNAME,
  EXPLORER_QUERY_WRAPPER_CLASSNAME,
} from "./explorerQueryShell";

import {
  type ActiveFilter,
  DEFAULT_OPERATORS,
  type QueryField,
  useQueryBarState,
} from "../common/hooks/useQueryBarState";

type SetFiltersFn = (filters: ActiveFilter[]) => void;
type ClearAllFn = () => void;
interface ObservabilityQueryBarProps {
  fields?: QueryField[];
  filters?: ActiveFilter[];
  setFilters: SetFiltersFn;
  onClearAll: ClearAllFn;
  placeholder?: string;
  className?: string;
  rightSlot?: ReactNode;
  valueHints?: Record<string, string[]>;
}

/**
 * Generic structured filter query bar for logs/traces observability pages.
 */
export default function ObservabilityQueryBar({
  fields = [],
  filters = [],
  setFilters,
  onClearAll,
  placeholder,
  className = "",
  rightSlot,
  valueHints,
}: ObservabilityQueryBarProps): JSX.Element {
  const { state, refs, actions } = useQueryBarState({
    fields,
    filters,
    setFilters,
    onClearAll,
  });

  const { step, pendingField, pendingOp, fieldSearch, showHints, hasFilters } = state;

  const { inputRef, wrapperRef } = refs;
  const {
    openDropdown,
    removeFilter,
    clearAll,
    onInputChange,
    handleKeyDown,
    toggleHints,
    pickField,
    pickOperator,
  } = actions;

  const filteredFields = fieldSearch
    ? fields.filter(
        (field) =>
          field.label.toLowerCase().includes(fieldSearch.toLowerCase()) ||
          field.key.toLowerCase().includes(fieldSearch.toLowerCase())
      )
    : fields;

  const groups = [...new Set(filteredFields.map((field) => field.group || "Other"))];
  const operators = pendingField?.operators || DEFAULT_OPERATORS;
  const showDropdown =
    step === 1 ||
    step === 2 ||
    (step === 3 && !!valueHints && !!pendingField && !!valueHints[pendingField.key]);

  const inputPlaceholder =
    placeholder ||
    (step === 3
      ? `Value for "${pendingField?.label}" — press Enter to apply`
      : filters.length > 0
        ? "Add another filter…"
        : "Click to filter, or type to search…");

  const inputValue = step === 3 ? state.valueInput : step <= 1 ? fieldSearch : "";

  return (
    <div className={cn(EXPLORER_QUERY_WRAPPER_CLASSNAME, "group", className)} ref={wrapperRef}>
      {}
      <div
        className={cn(
          EXPLORER_QUERY_SURFACE_CLASSNAME,
          EXPLORER_QUERY_INNER_ROW_CLASSNAME,
          "cursor-text flex-wrap",
          step > 0 &&
            "border-[color-mix(in_oklch,var(--color-primary),transparent_65%)] shadow-[0_0_0_1px_rgba(96,165,250,0.2),0_22px_54px_rgba(2,6,23,0.38),inset_0_1px_0_rgba(255,255,255,0.05)]"
        )}
        style={{ rowGap: 4 }}
        onClick={() => {
          openDropdown();
        }}
      >
        <Search size={14} className={cn(EXPLORER_QUERY_ICON_CLASSNAME, step > 0 && "text-info")} />
        <button
          type="button"
          title="Add structured filter"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-foreground-secondary transition-colors hover:border-[var(--color-primary-subtle-28)] hover:text-foreground"
          onClick={(event) => {
            event.stopPropagation();
            openDropdown();
          }}
        >
          <Plus size={14} />
        </button>

        {}
        <div className="flex flex-wrap items-center gap-[5px]">
          {filters.map((filter, index) => (
            <span
              key={index}
              className="inline-flex animate-oqb-pill-in items-center gap-[3px] whitespace-nowrap rounded-2xl border border-[var(--color-primary-subtle-28)] bg-[var(--color-primary-subtle-12)] px-[10px] py-[2px] pr-2 text-[11px] text-primary"
            >
              {filter.fieldGroup && (
                <span className="mr-[1px] text-[10px] opacity-40">{filter.fieldGroup} /</span>
              )}
              <span className="opacity-75">{filter.fieldLabel || filter.field}</span>
              <span className="mx-0.5 font-mono opacity-50">
                {filter.operatorSymbol || filter.operator}
              </span>
              <span className="font-semibold text-foreground">"{filter.value}"</span>
              <button
                type="button"
                className="flex cursor-pointer border-none bg-transparent pl-0.5 text-primary leading-none opacity-55 transition-opacity duration-100 hover:opacity-100"
                onClick={(event) => {
                  event.stopPropagation();
                  removeFilter(index);
                }}
                title="Remove filter"
              >
                <X size={10} />
              </button>
            </span>
          ))}

          {step >= 2 && pendingField && (
            <span className="inline-flex animate-oqb-pill-in items-center gap-[3px] whitespace-nowrap rounded-2xl border border-[var(--color-primary-subtle-28)] border-dashed bg-[var(--color-primary-subtle-08)] px-[10px] py-[2px] pr-2 text-[11px] text-primary">
              <span className="opacity-75">{pendingField.label}</span>
              {pendingOp && <span className="mx-0.5 font-mono opacity-50">{pendingOp.symbol}</span>}
              <button
                type="button"
                className="flex cursor-pointer border-none bg-transparent pl-0.5 text-primary leading-none opacity-55 transition-opacity duration-100 hover:opacity-100"
                onClick={(event) => {
                  event.stopPropagation();
                  actions.closeDropdown();
                }}
              >
                <X size={10} />
              </button>
            </span>
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          className="min-w-[160px] flex-1 border-none bg-transparent text-[13px] text-foreground leading-[1.4] outline-none placeholder:text-muted-foreground"
          placeholder={inputPlaceholder}
          value={inputValue}
          onChange={onInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (step === 0) openDropdown();
          }}
        />

        {}
        <div
          className="ml-auto flex shrink-0 items-center gap-1.5"
          onClick={(event) => event.stopPropagation()}
        >
          {filters.length > 0 && (
            <span
              className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[var(--color-primary-subtle-25)] font-bold text-[10px] text-primary"
              title={`${filters.length} active filter${filters.length !== 1 ? "s" : ""}`}
            >
              {filters.length}
            </span>
          )}
          {hasFilters && (
            <button
              type="button"
              className="cursor-pointer whitespace-nowrap rounded-md border-none bg-transparent px-2 py-[3px] text-[11px] text-muted-foreground transition-colors duration-100 hover:bg-error-subtle hover:text-error"
              onClick={(event) => {
                event.stopPropagation();
                clearAll();
              }}
              title="Clear all filters"
            >
              Clear all
            </button>
          )}
          <button
            type="button"
            className={cn(
              "flex cursor-pointer items-center rounded-md border border-transparent bg-transparent p-1 text-muted-foreground transition-all duration-100",
              "hover:border-border hover:bg-secondary hover:text-[color:var(--text-secondary)]",
              showHints && "border-border bg-secondary text-[color:var(--text-secondary)]"
            )}
            title="Keyboard shortcuts"
            onClick={toggleHints}
          >
            <Keyboard size={13} />
          </button>
          {rightSlot}
        </div>
      </div>

      {showHints && <QueryKeyboardHints />}

      {showDropdown && (
        <div
          className={cn(
            EXPLORER_QUERY_DROPDOWN_CLASSNAME,
            "max-h-[320px] animate-oqb-fade-in overflow-y-auto"
          )}
          onMouseDown={(event) => event.preventDefault()}
        >
          {step === 1 && (
            <QueryFieldPicker
              fieldSearch={fieldSearch}
              filtersLength={filters.length}
              fieldsLength={fields.length}
              groups={groups}
              filteredFields={filteredFields}
              onPickField={pickField}
            />
          )}

          {step === 2 && pendingField && (
            <QueryOperatorPicker
              pendingField={pendingField}
              operators={operators}
              onPickOperator={pickOperator}
            />
          )}

          {step === 3 && pendingField && valueHints && valueHints[pendingField.key] && (
            <QueryValuePicker
              pendingField={pendingField}
              valueInput={state.valueInput}
              hints={valueHints[pendingField.key]}
              onPickValue={actions.pickValue}
            />
          )}
        </div>
      )}
    </div>
  );
}
