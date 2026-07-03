import { cn } from "@/lib/utils";

interface CardProps extends React.ComponentPropsWithRef<"div"> {
  elevation?: 0 | 1 | 2 | 3;
  padding?: "xs" | "sm" | "md" | "lg" | "xl";
}

const elevationClasses: Record<NonNullable<CardProps["elevation"]>, string> = {
  0: "bg-transparent",
  1: "bg-card border border-border shadow-[var(--shadow-sm)]",
  2: "bg-surface-2 border border-border shadow-[var(--shadow-md)]",
  3: "bg-surface-3 border border-border shadow-[var(--shadow-lg)]",
};

const paddingClasses: Record<NonNullable<CardProps["padding"]>, string> = {
  xs: "p-2.5",
  sm: "p-3",
  md: "p-4",
  lg: "p-5",
  xl: "p-6",
};

function Card({ elevation = 1, padding = "md", className, children, ref, ...props }: CardProps) {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-[var(--card-radius)] transition-[box-shadow,border-color,background-color] duration-200",
        elevationClasses[elevation],
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { Card, type CardProps };
