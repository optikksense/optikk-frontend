import { cn } from "@/lib/utils";

export type PillVariant =
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "stream";

export interface PillProps extends React.ComponentPropsWithRef<"span"> {
  readonly variant?: PillVariant;
  readonly dot?: boolean;
  readonly size?: "sm" | "md";
}

const VARIANT_CLASS: Record<PillVariant, string> = {
  neutral: "bg-[var(--bg-tertiary)] text-[var(--text-secondary)]",
  primary: "bg-[var(--color-primary-subtle-12)] text-[var(--color-primary)]",
  success: "bg-[var(--color-success-subtle)] text-[var(--color-success)]",
  warning: "bg-[var(--color-warning-subtle)] text-[var(--color-warning)]",
  error: "bg-[var(--color-error-subtle)] text-[var(--color-error)]",
  info: "bg-[var(--color-info-subtle)] text-[var(--color-info)]",
  stream: "bg-[var(--color-info-subtle)] text-[var(--color-stream)]",
};

const DOT_CLASS: Record<PillVariant, string> = {
  neutral: "bg-[var(--text-muted)]",
  primary: "bg-[var(--color-primary)]",
  success: "bg-[var(--color-success)]",
  warning: "bg-[var(--color-warning)]",
  error: "bg-[var(--color-error)]",
  info: "bg-[var(--color-info)]",
  stream: "bg-[var(--color-stream)] animate-pulse",
};

const SIZE_CLASS: Record<NonNullable<PillProps["size"]>, string> = {
  sm: "px-1.5 py-0 text-[10px] gap-1 h-[18px]",
  md: "px-2 py-0.5 text-[11px] gap-1.5 h-[20px]",
};

export function Pill({
  variant = "neutral",
  dot = false,
  size = "md",
  className,
  children,
  ref,
  ...rest
}: PillProps) {
  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full font-medium leading-none",
        SIZE_CLASS[size],
        VARIANT_CLASS[variant],
        className
      )}
      {...rest}
    >
      {dot ? (
        <span
          aria-hidden
          className={cn("inline-block h-1.5 w-1.5 rounded-full", DOT_CLASS[variant])}
        />
      ) : null}
      {children}
    </span>
  );
}
