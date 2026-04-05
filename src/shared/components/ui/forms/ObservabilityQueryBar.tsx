import { Keyboard, Plus, Search, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

import type { QueryFieldOption } from '@/features/explorer-core/constants/fields';

import QueryFieldPicker from './QueryFieldPicker';
import QueryKeyboardHints from './QueryKeyboardHints';
import QueryOperatorPicker from './QueryOperatorPicker';
import QueryValuePicker from './QueryValuePicker';
import {
  EXPLORER_QUERY_DROPDOWN_CLASSNAME,
  EXPLORER_QUERY_ICON_CLASSNAME,
  EXPLORER_QUERY_INNER_ROW_CLASSNAME,
  EXPLORER_QUERY_SURFACE_CLASSNAME,
  EXPLORER_QUERY_WRAPPER_CLASSNAME,
} from './explorerQueryShell';

import {
  useQueryBarState,
  type QueryField,
  type ActiveFilter,
  DEFAULT_OPERATORS,
} from '../common/hooks/useQueryBarState';

type QueryBarSearchValue = string | string[] | number | boolean;

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
  className = '',
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

  const groups = [...new Set(filteredFields.map((field) => field.group || 'Other'))];
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
        ? 'Add another filter…'
        : 'Click to filter, or type to search…');

  const inputValue = step === 3 ? state.valueInput : step <= 1 ? fieldSearch : '';

  return (
    <div className={cn(EXPLORER_QUERY_WRAPPER_CLASSNAME, 'group', className)} ref={wrapperRef}>
      {/* Inner input row */}
      <div
        className={cn(
          EXPLORER_QUERY_SURFACE_CLASSNAME,
          EXPLORER_QUERY_INNER_ROW_CLASSNAME,
          'cursor-text flex-wrap',
          step > 0 &&
            'border-[rgba(96,165,250,0.48)] shadow-[0_0_0_1px_rgba(96,165,250,0.2),0_22px_54px_rgba(2,6,23,0.38),inset_0_1px_0_rgba(255,255,255,0.05)]'
        )}
        style={{ rowGap: 4 }}
        onClick={() => {
          openDropdown();
        }}
      >
        <Search
          size={14}
          className={cn(EXPLORER_QUERY_ICON_CLASSNAME, step > 0 && 'text-[var(--color-info)]')}
        />
        <button
          type="button"
          title="Add structured filter"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)] transition-colors hover:border-[var(--color-primary-subtle-28)] hover:text-[var(--text-primary)]"
          onClick={(event) => {
            event.stopPropagation();
            openDropdown();
          }}
        >
          <Plus size={14} />
        </button>

        {/* Pills */}
        <div className="flex items-center gap-[5px] flex-wrap">
          {filters.map((filter, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-[3px] bg-[var(--color-primary-subtle-12)] border border-[var(--color-primary-subtle-28)] rounded-2xl px-[10px] pr-2 py-[2px] text-[11px] text-[var(--color-primary)] whitespace-nowrap animate-oqb-pill-in"
            >
              {filter.fieldGroup && (
                <span className="opacity-40 text-[10px] mr-[1px]">{filter.fieldGroup} /</span>
              )}
              <span className="opacity-75">{filter.fieldLabel || filter.field}</span>
              <span className="opacity-50 mx-0.5 font-mono">
                {filter.operatorSymbol || filter.operator}
              </span>
              <span className="font-semibold text-[var(--text-primary)]">"{filter.value}"</span>
              <button
                className="bg-transparent border-none text-[var(--color-primary)] cursor-pointer pl-0.5 flex opacity-55 transition-opacity duration-100 leading-none hover:opacity-100"
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
            <span className="inline-flex items-center gap-[3px] bg-[var(--color-primary-subtle-08)] border border-dashed border-[var(--color-primary-subtle-28)] rounded-2xl px-[10px] pr-2 py-[2px] text-[11px] text-[var(--color-primary)] whitespace-nowrap animate-oqb-pill-in">
              <span className="opacity-75">{pendingField.label}</span>
              {pendingOp && <span className="opacity-50 mx-0.5 font-mono">{pendingOp.symbol}</span>}
              <button
                className="bg-transparent border-none text-[var(--color-primary)] cursor-pointer pl-0.5 flex opacity-55 transition-opacity duration-100 leading-none hover:opacity-100"
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
          className="flex-1 bg-transparent border-none outline-none text-foreground text-[13px] min-w-[160px] leading-[1.4] placeholder:text-muted-foreground"
          placeholder={inputPlaceholder}
          value={inputValue}
          onChange={onInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (step === 0) openDropdown();
          }}
        />

        {/* Right controls */}
        <div
          className="flex items-center gap-1.5 ml-auto shrink-0"
          onClick={(event) => event.stopPropagation()}
        >
          {filters.length > 0 && (
            <span
              className="inline-flex items-center justify-center w-[18px] h-[18px] bg-[var(--color-primary-subtle-25)] text-[var(--color-primary)] rounded-full text-[10px] font-bold"
              title={`${filters.length} active filter${filters.length !== 1 ? 's' : ''}`}
            >
              {filters.length}
            </span>
          )}
          {hasFilters && (
            <button
              className="bg-transparent border-none text-muted-foreground cursor-pointer text-[11px] px-2 py-[3px] rounded-md whitespace-nowrap transition-colors duration-100 hover:text-error hover:bg-[rgba(240,68,56,0.08)]"
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
            className={cn(
              'bg-transparent border border-transparent text-muted-foreground cursor-pointer p-1 rounded-md flex items-center transition-all duration-100',
              'hover:border-border hover:text-[color:var(--text-secondary)] hover:bg-secondary',
              showHints && 'border-border text-[color:var(--text-secondary)] bg-secondary'
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
            'max-h-[320px] overflow-y-auto animate-oqb-fade-in'
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
