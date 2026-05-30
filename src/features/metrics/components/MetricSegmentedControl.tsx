import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface SegmentOption<T extends string> {
  readonly value: T;
  readonly label: string;
  readonly icon?: ReactNode;
}

interface MetricSegmentedControlProps<T extends string> {
  readonly options: ReadonlyArray<SegmentOption<T>>;
  readonly value: T;
  readonly onChange: (value: T) => void;
  readonly size?: "sm" | "md";
  readonly className?: string;
}

/** Inline segmented control matching the metrics explorer view-option styling. */
export function MetricSegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = "md",
  className,
}: MetricSegmentedControlProps<T>) {
  const heightClass = size === "sm" ? "h-7 px-2.5 text-[11px]" : "h-8 px-3 text-[12px]";
  return (
    <div
      className={cn(
        "inline-flex overflow-hidden rounded-lg border border-[var(--border-color)]",
        className
      )}
    >
      {options.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            title={option.label}
            className={cn(
              "flex items-center gap-1.5 border-r font-medium transition-colors duration-150 last:border-r-0",
              heightClass,
              active
                ? "border-[color-mix(in_oklch,var(--color-info),transparent_65%)] bg-[var(--color-info-subtle)] text-[var(--text-primary)]"
                : "border-[var(--border-color)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)]"
            )}
          >
            {option.icon}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
