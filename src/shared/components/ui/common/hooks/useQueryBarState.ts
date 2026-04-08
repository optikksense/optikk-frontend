import {
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

export interface QueryOperator {
  key: string;
  label: string;
  symbol: string;
}

export interface QueryField {
  key: string;
  label: string;
  icon?: ReactNode;
  group?: string;
  operators?: QueryOperator[];
}

export interface ActiveFilter {
  field: string;
  operator: string;
  value: string;
  fieldLabel?: string;
  fieldGroup?: string;
  operatorLabel?: string;
  operatorSymbol?: string;
}

export const DEFAULT_OPERATORS: QueryOperator[] = [
  { key: "equals", label: "equals", symbol: "=" },
  { key: "not_equals", label: "not equals", symbol: "!=" },
  { key: "contains", label: "contains", symbol: "~" },
  { key: "gt", label: "greater than", symbol: ">" },
  { key: "lt", label: "less than", symbol: "<" },
];

export interface UseQueryBarStateOptions {
  fields: QueryField[];
  filters: ActiveFilter[];
  setFilters: (filters: ActiveFilter[]) => void;
  onClearAll: () => void;
}

/**
 * Headless hook to manage the state machine and keyboard logic for the ObservabilityQueryBar.
 */
export function useQueryBarState({
  fields,
  filters,
  setFilters,
  onClearAll,
}: UseQueryBarStateOptions) {
  // 0=closed, 1=pick field, 2=pick operator, 3=enter value
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [pendingField, setPendingField] = useState<QueryField | null>(null);
  const [pendingOp, setPendingOp] = useState<QueryOperator | null>(null);
  const [valueInput, setValueInput] = useState("");
  const [fieldSearch, setFieldSearch] = useState("");
  const [showHints, setShowHints] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const closeDropdown = useCallback((): void => {
    setStep(0);
    setPendingField(null);
    setPendingOp(null);
    setValueInput("");
    setFieldSearch("");
  }, []);

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent): void => {
      if (!wrapperRef.current || !(event.target instanceof Node)) return;
      if (!wrapperRef.current.contains(event.target)) {
        closeDropdown();
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [closeDropdown]);

  const openDropdown = (): void => {
    if (step >= 1) return;
    setStep(1);
    setFieldSearch("");
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
    setValueInput("");
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const commitFilter = (overrideValue?: string): void => {
    if (!pendingField || !pendingOp) return;

    const finalValue = typeof overrideValue === "string" ? overrideValue : valueInput;
    const trimmedValue = finalValue.trim();
    if (!trimmedValue) return;

    setFilters([
      ...filters,
      {
        field: pendingField.key,
        fieldLabel: pendingField.label,
        fieldGroup: pendingField.group || "",
        operator: pendingOp.key,
        operatorLabel: pendingOp.label,
        operatorSymbol: pendingOp.symbol,
        value: trimmedValue,
      },
    ]);
    closeDropdown();
  };

  const pickValue = (value: string): void => {
    setValueInput(value);
    commitFilter(value);
  };

  const removeFilter = (index: number): void => {
    setFilters(filters.filter((_, currentIndex) => currentIndex !== index));
  };

  const clearAll = (): void => {
    onClearAll();
    closeDropdown();
  };

  const onInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const nextValue = event.target.value;
    if (step === 3) {
      setValueInput(nextValue);
      return;
    }

    setFieldSearch(nextValue);
    if (step === 0) setStep(1);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (step === 3 && event.key === "Enter") {
      event.preventDefault();
      commitFilter();
    }

    if (event.key === "Escape") {
      closeDropdown();
      inputRef.current?.blur();
    }

    if (event.key === "Backspace") {
      if (step === 3 && valueInput === "") {
        event.preventDefault();
        setPendingOp(null);
        setStep(2);
      } else if (step === 2) {
        event.preventDefault();
        setPendingField(null);
        setStep(1);
        setFieldSearch("");
      } else if (step === 1 && fieldSearch === "") {
        event.preventDefault();
        closeDropdown();
      } else if (step === 0 && fieldSearch === "" && filters.length > 0) {
        event.preventDefault();
        setFilters(filters.slice(0, -1));
      }
    }

    // Tab to autocomplete if only one field matches
    if (step === 1 && event.key === "Tab") {
      const filtered = fieldSearch
        ? fields.filter(
            (field) =>
              field.label.toLowerCase().includes(fieldSearch.toLowerCase()) ||
              field.key.toLowerCase().includes(fieldSearch.toLowerCase())
          )
        : fields;

      if (filtered.length === 1) {
        event.preventDefault();
        pickField(filtered[0]);
      }
    }
  };

  const toggleHints = () => setShowHints((prev) => !prev);

  return {
    state: {
      step,
      pendingField,
      pendingOp,
      valueInput,
      fieldSearch,
      showHints,
      hasFilters: filters.length > 0,
    },
    refs: {
      inputRef,
      wrapperRef,
    },
    actions: {
      openDropdown,
      closeDropdown,
      pickField,
      pickOperator,
      pickValue,
      commitFilter,
      removeFilter,
      clearAll,
      onInputChange,
      handleKeyDown,
      toggleHints,
    },
  };
}
