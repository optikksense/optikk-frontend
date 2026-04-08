import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import React from "react";

import { cn } from "@/lib/utils";

export interface SelectOption {
  label: string;
  value: any;
}

export interface SelectProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: any;
  onChange?: (value: any) => void;
  options: SelectOption[];
  placeholder?: string;
  size?: "sm" | "md" | "lg";
  multiple?: boolean;
  allowClear?: boolean;
}

const sizeClasses: Record<NonNullable<SelectProps["size"]>, string> = {
  sm: "h-8 text-[12px] px-3",
  md: "h-9 text-[13px] px-3.5",
  lg: "h-10 text-[14px] px-4",
};

function Select({
  value,
  onChange,
  options,
  placeholder = "Select...",
  size = "md",
  multiple,
  allowClear: _allowClear,
  className,
  style,
  ...props
}: SelectProps) {
  // For multiple select, fall back to a custom implementation since Radix Select
  // does not natively support multi-select.
  if (multiple) {
    return (
      <MultiSelect
        value={value}
        onChange={onChange}
        options={options}
        placeholder={placeholder}
        size={size}
        className={className}
        style={style}
        {...props}
      />
    );
  }

  const selectedLabel = options.find((o) => o.value === value)?.label;

  return (
    <div className={cn("relative inline-block", className)} style={style} {...props}>
      <SelectPrimitive.Root
        value={value !== undefined && value !== null ? String(value) : undefined}
        onValueChange={(v) => {
          const opt = options.find((o) => String(o.value) === v);
          onChange?.(opt ? opt.value : v);
        }}
      >
        <SelectPrimitive.Trigger
          className={cn(
            "inline-flex w-full items-center justify-between gap-2 rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] shadow-[var(--shadow-sm)] outline-none transition-[background-color,border-color,box-shadow] hover:border-[rgba(124,127,242,0.5)] focus:ring-2 focus:ring-[rgba(124,127,242,0.18)]",
            sizeClasses[size],
            !selectedLabel && "text-[var(--text-muted)]"
          )}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon>
            <ChevronDown size={14} className="flex-shrink-0" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            sideOffset={4}
            className="data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 z-50 min-w-[140px] overflow-hidden rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-[var(--shadow-md)] data-[state=closed]:animate-out data-[state=open]:animate-in"
          >
            <SelectPrimitive.Viewport className="max-h-60 p-1">
              {options.map((option, index) => (
                <SelectPrimitive.Item
                  key={`${option.label}-${index}`}
                  value={String(option.value)}
                  className={cn(
                    "relative flex w-full cursor-default select-none items-center rounded-md py-2 pr-2.5 pl-8 text-[13px] outline-none transition-colors focus:bg-[var(--bg-hover)] data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                  )}
                >
                  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    <SelectPrimitive.ItemIndicator>
                      <Check size={14} />
                    </SelectPrimitive.ItemIndicator>
                  </span>
                  <SelectPrimitive.ItemText>
                    <span className="truncate">{option.label}</span>
                  </SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </div>
  );
}

/** Internal multi-select using checkboxes (Radix Select doesn't support multi). */
function MultiSelect({
  value,
  onChange,
  options,
  placeholder,
  size = "md",
  className,
  style,
  ...props
}: Omit<SelectProps, "multiple" | "allowClear">) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const handler = (event: MouseEvent): void => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const selectedValues = Array.isArray(value) ? value : [];
  const selectedLabels = options
    .filter((option) => selectedValues.includes(option.value))
    .map((option) => option.label);
  const displayText = selectedLabels.length > 0 ? selectedLabels.join(", ") : placeholder;

  const handleSelect = (optionValue: any): void => {
    if (!onChange) return;
    const current = Array.isArray(value) ? value : [];
    const next = current.includes(optionValue)
      ? current.filter((entry: any) => entry !== optionValue)
      : [...current, optionValue];
    onChange(next);
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative inline-block", className)}
      style={style}
      {...props}
    >
      <button
        type="button"
        onClick={() => setOpen((c) => !c)}
        className={cn(
          "inline-flex w-full items-center justify-between gap-2 rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] shadow-[var(--shadow-sm)] transition-[background-color,border-color,box-shadow] hover:border-[rgba(124,127,242,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(124,127,242,0.18)]",
          sizeClasses[size],
          selectedLabels.length === 0 && "text-[var(--text-muted)]"
        )}
      >
        <span className="truncate">{displayText}</span>
        <ChevronDown
          size={14}
          className={cn("flex-shrink-0 transition-transform", open && "rotate-180")}
        />
      </button>
      {open ? (
        <div className="absolute z-50 mt-1 w-full min-w-[140px] overflow-hidden rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-[var(--shadow-md)]">
          <div className="max-h-60 overflow-y-auto py-1">
            {options.map((option, index) => {
              const selected = selectedValues.includes(option.value);
              return (
                <button
                  key={`${option.label}-${index}`}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] transition-colors hover:bg-[var(--bg-hover)]",
                    selected ? "text-[var(--color-primary)]" : "text-[var(--text-primary)]"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded border",
                      selected
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
                        : "border-[var(--border-color)]"
                    )}
                  >
                    {selected ? <Check size={10} className="text-white" /> : null}
                  </span>
                  <span className="truncate">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export { Select };
