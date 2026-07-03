import { cn } from "@/lib/utils";

interface ButtonProps extends React.ComponentPropsWithRef<"button"> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-hover border-transparent shadow-[var(--shadow-sm)]",
  secondary: "bg-muted text-foreground hover:bg-accent border-border shadow-[var(--shadow-sm)]",
  ghost:
    "bg-transparent text-foreground-secondary hover:bg-accent hover:text-foreground border-transparent",
  danger: "bg-error text-white hover:opacity-90 border-transparent shadow-[var(--shadow-sm)]",
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-8 px-3 text-[12px] gap-1.5 rounded-[var(--card-radius)]",
  md: "h-9 px-3.5 text-[13px] gap-1.5 rounded-[var(--card-radius)]",
  lg: "h-10 px-4 text-[14px] gap-2 rounded-[var(--card-radius)]",
};

function Button({
  variant = "secondary",
  size = "md",
  icon,
  fullWidth,
  loading,
  className,
  disabled,
  children,
  ref,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center border font-medium transition-[background-color,border-color,color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_oklch,var(--color-primary),transparent_65%)] focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}

export { Button };
