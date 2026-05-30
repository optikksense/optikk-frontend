import { cn } from "@/lib/utils";

export type BadgeVariant = "default" | "primary" | "success" | "error" | "warning" | "info";

export interface BadgeProps extends React.ComponentPropsWithRef<"div"> {
  variant?: BadgeVariant;
  color?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-[var(--border-color)]",
  primary:
    "bg-[var(--color-primary-subtle-12)] text-[var(--color-primary)] border-[color-mix(in_oklch,var(--color-primary),transparent_70%)]",
  success:
    "bg-[var(--color-success-subtle)] text-[var(--color-success)] border-[color-mix(in_oklch,var(--color-success),transparent_70%)]",
  error:
    "bg-[var(--color-error-subtle)] text-[var(--color-error)] border-[color-mix(in_oklch,var(--color-error),transparent_70%)]",
  warning:
    "bg-[var(--color-warning-subtle)] text-[var(--color-warning)] border-[color-mix(in_oklch,var(--color-warning),transparent_70%)]",
  info: "bg-[var(--color-info-subtle)] text-[var(--color-info)] border-[color-mix(in_oklch,var(--color-info),transparent_70%)]",
};

// Legacy color names map onto the theme-aware semantic variants.
const colorAlias: Record<string, BadgeVariant> = {
  blue: "info",
  purple: "primary",
  green: "success",
  red: "error",
  orange: "warning",
  yellow: "warning",
};

function Badge({ variant = "default", color, className, children, ref, ...props }: BadgeProps) {
  const resolved = color ? (colorAlias[color] ?? "default") : variant;

  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 font-medium text-[11px] leading-none",
        variantClasses[resolved],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { Badge };
