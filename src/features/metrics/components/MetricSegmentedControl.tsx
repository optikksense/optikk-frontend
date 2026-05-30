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
        "inline-flex overflow-hidden rounded-lg border border-border",
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
                ? "border-[color-mix(in_oklch,var(--color-info),transparent_65%)] bg-info-subtle text-foreground"
                : "border-border text-foreground-muted hover:bg-accent hover:text-foreground-secondary"
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
