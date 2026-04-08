import { cn } from "@/lib/utils";

export interface IconButtonProps extends React.ComponentPropsWithRef<"button"> {
  icon: React.ReactNode;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "ghost" | "danger";
  label?: string;
}

const variantClasses: Record<NonNullable<IconButtonProps["variant"]>, string> = {
  primary: "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]",
  secondary:
    "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] border border-[var(--border-color)]",
  ghost:
    "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]",
  danger: "bg-[var(--color-error)] text-white hover:opacity-90",
};

const sizeClasses: Record<NonNullable<IconButtonProps["size"]>, string> = {
  sm: "h-7 w-7 rounded",
  md: "h-8 w-8 rounded-md",
  lg: "h-10 w-10 rounded-md",
};

function IconButton({
  icon,
  size = "md",
  variant = "ghost",
  label,
  className,
  ref,
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      aria-label={label}
      title={label}
      {...props}
    >
      {icon}
    </button>
  );
}

export { IconButton };
