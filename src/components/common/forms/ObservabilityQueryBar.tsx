import { Keyboard, Search, X } from 'lucide-react';
import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

import {
  QueryFieldPicker,
  QueryKeyboardHints,
  QueryOperatorPicker,
} from '@components/ui/query-bar';

import './ObservabilityQueryBar.css';

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
  operators?: QueryOperator[];
}

interface ActiveFilter {
  field: string;
  operator: string;
  value: string;
  fieldLabel?: string;
  fieldGroup?: string;
  operatorLabel?: string;
  operatorSymbol?: string;
}

type QueryBarSearchValue = string | string[] | number | boolean;

type SetFiltersFn = (filters: ActiveFilter[]) => void;

type SetSearchTextFn = (value: string) => void;

type ClearAllFn = () => void;

interface ObservabilityQueryBarProps {
  fields?: QueryField[];
  filters?: ActiveFilter[];
  setFilters: SetFiltersFn;
  searchText?: QueryBarSearchValue;
  setSearchText: SetSearchTextFn;
  onClearAll: ClearAllFn;
  placeholder?: string;
  className?: string;
  rightSlot?: ReactNode;
}

const DEFAULT_OPERATORS: QueryOperator[] = [
  { key: 'equals', label: 'equals', symbol: '=' },
  { key: 'not_equals', label: 'not equals', symbol: '!=' },
  { key: 'contains', label: 'contains', symbol: '~' },
  { key: 'gt', label: 'greater than', symbol: '>' },
  { key: 'lt', label: 'less than', symbol: '<' },
];

/**
 * Generic structured filter query bar for logs/traces observability pages.
 * @param props Component props.
 * @returns Query bar with field/operator/value filter flow.
 */
export default function ObservabilityQueryBar({
  fields = [],
  filters = [],
  setFilters,
  searchText = '',
  setSearchText,
  onClearAll,
  placeholder,
  className = '',
  rightSlot,
}: ObservabilityQueryBarProps): JSX.Element {
  // 0=closed, 1=pick field, 2=pick operator, 3=enter value
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [pendingField, setPendingField] = useState<QueryField | null>(null);
  const [pendingOp, setPendingOp] = useState<QueryOperator | null>(null);
  const [valueInput, setValueInput] = useState('');
  const [fieldSearch, setFieldSearch] = useState('');
  const [showHints, setShowHints] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const normalizedSearchText = String(searchText || '');
  const hasFilters = filters.length > 0 || normalizedSearchText.length > 0;

  const closeDropdown = useCallback((): void => {
    setStep(0);
    setPendingField(null);
    setPendingOp(null);
    setValueInput('');
    setFieldSearch('');
  }, []);

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent): void => {
      if (!wrapperRef.current || !(event.target instanceof Node)) return;
      if (!wrapperRef.current.contains(event.target)) {
        closeDropdown();
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [closeDropdown]);

  const openDropdown = (): void => {
    if (step >= 1) return;
    setStep(1);
    setFieldSearch('');
    window.setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const pickField = (field: QueryField): void => {
    setPendingField(field);
    setStep(2);
  };

  const pickOperator = (operator: QueryOperator): void => {
    setPendingOp(operator);
    setStep(3);
    setValueInput('');
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const commitFilter = (): void => {
    if (!pendingField || !pendingOp) return;

    const trimmedValue = valueInput.trim();
    if (!trimmedValue) return;

    setFilters([
      ...filters,
      {
        field: pendingField.key,
        fieldLabel: pendingField.label,
        fieldGroup: pendingField.group || '',
        operator: pendingOp.key,
        operatorLabel: pendingOp.label,
        operatorSymbol: pendingOp.symbol,
        value: trimmedValue,
      },
    ]);
    closeDropdown();
  };

  const removeFilter = (index: number): void => {
    setFilters(filters.filter((_, currentIndex) => currentIndex !== index));
  };

  const filteredFields = fieldSearch
    ? fields.filter(
        (field) =>
          field.label.toLowerCase().includes(fieldSearch.toLowerCase()) ||
          field.key.toLowerCase().includes(fieldSearch.toLowerCase()),
      )
    : fields;

  const groups = [...new Set(filteredFields.map((field) => field.group || 'Other'))];
  const operators = pendingField?.operators || DEFAULT_OPERATORS;
  const showDropdown = step === 1 || step === 2;

  const inputPlaceholder =
    placeholder ||
    (step === 3
      ? `Value for "${pendingField?.label}" — press Enter to apply`
      : filters.length > 0
        ? 'Add another filter…'
        : 'Click to filter, or type to search…');

  const inputValue = step === 3 ? valueInput : step <= 1 ? fieldSearch : '';

  const onInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const nextValue = event.target.value;
    if (step === 3) {
      setValueInput(nextValue);
      return;
    }

    setFieldSearch(nextValue);
    setSearchText(nextValue);
    if (step === 0) setStep(1);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (step === 3 && event.key === 'Enter') {
      event.preventDefault();
      commitFilter();
    }

    if (event.key === 'Escape') {
      closeDropdown();
      inputRef.current?.blur();
    }

    if (event.key === 'Backspace') {
      if (step === 3 && valueInput === '') {
        event.preventDefault();
        setPendingOp(null);
        setStep(2);
      } else if (step === 2) {
        event.preventDefault();
        setPendingField(null);
        setStep(1);
        setFieldSearch('');
      } else if (step === 1 && fieldSearch === '') {
        event.preventDefault();
        closeDropdown();
      } else if (
        step === 0 &&
        fieldSearch === '' &&
        normalizedSearchText === '' &&
        filters.length > 0
      ) {
        event.preventDefault();
        setFilters(filters.slice(0, -1));
      }
    }

    if (step === 1 && event.key === 'Tab' && filteredFields.length === 1) {
      event.preventDefault();
      pickField(filteredFields[0]);
    }
  };

  return (
    <div className={`oqb ${className}`} ref={wrapperRef}>
      <div
        className={`oqb__inner ${step > 0 ? 'oqb__inner--focused' : ''}`}
        onClick={() => {
          if (step === 0) openDropdown();
        }}
      >
        <Search size={14} className="oqb__search-icon" />

        <div className="oqb__pills">
          {filters.map((filter, index) => (
            <span key={index} className="oqb__pill">
              {filter.fieldGroup && <span className="oqb__pill-group">{filter.fieldGroup} /</span>}
              <span className="oqb__pill-field">{filter.fieldLabel || filter.field}</span>
              <span className="oqb__pill-op">{filter.operatorSymbol || filter.operator}</span>
              <span className="oqb__pill-value">"{filter.value}"</span>
              <button
                className="oqb__pill-close"
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
            <span className="oqb__pill oqb__pill--pending">
              <span className="oqb__pill-field">{pendingField.label}</span>
              {pendingOp && <span className="oqb__pill-op">{pendingOp.symbol}</span>}
              <button
                className="oqb__pill-close"
                onClick={(event) => {
                  event.stopPropagation();
                  closeDropdown();
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
          className="oqb__input"
          placeholder={inputPlaceholder}
          value={inputValue}
          onChange={onInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (step === 0) openDropdown();
          }}
        />

        <div
          className="oqb__right"
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          {filters.length > 0 && (
            <span
              className="oqb__filter-count"
              title={`${filters.length} active filter${filters.length !== 1 ? 's' : ''}`}
            >
              {filters.length}
            </span>
          )}
          {hasFilters && (
            <button
              className="oqb__clear"
              onClick={(event) => {
                event.stopPropagation();
                onClearAll();
                closeDropdown();
              }}
              title="Clear all filters"
            >
              Clear all
            </button>
          )}
          <button
            className={`oqb__hint-btn ${showHints ? 'oqb__hint-btn--active' : ''}`}
            title="Keyboard shortcuts"
            onClick={() => setShowHints((currentValue) => !currentValue)}
          >
            <Keyboard size={13} />
          </button>
          {rightSlot}
        </div>
      </div>

      {showHints && (
        <QueryKeyboardHints />
      )}

      {showDropdown && (
        <div className="oqb__dropdown" onMouseDown={(event) => event.preventDefault()}>
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
        </div>
      )}
    </div>
  );
}
