import { cn } from "@/lib/utils";

export interface CardProps extends React.ComponentPropsWithRef<"div"> {
  elevation?: 0 | 1 | 2 | 3;
  padding?: "xs" | "sm" | "md" | "lg" | "xl";
}

const elevationClasses: Record<NonNullable<CardProps["elevation"]>, string> = {
  0: "bg-transparent",
  1: "bg-[var(--bg-card)] border border-[var(--border-color)] shadow-[var(--shadow-sm)]",
  2: "bg-[var(--surface-2-bg)] border border-[var(--border-color)] shadow-[var(--shadow-md)]",
  3: "bg-[var(--surface-3-bg)] border border-[var(--border-color)] shadow-[var(--shadow-lg)]",
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

function CardHeader({ className, ref, ...props }: React.ComponentPropsWithRef<"div">) {
  return <div ref={ref} className={cn("flex flex-col space-y-1.5 p-0", className)} {...props} />;
}

function CardTitle({ className, ref, ...props }: React.ComponentPropsWithRef<"h3">) {
  return (
    <h3
      ref={ref}
      className={cn("font-semibold text-[15px] leading-snug tracking-[0.01em]", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ref, ...props }: React.ComponentPropsWithRef<"p">) {
  return <p ref={ref} className={cn("text-[12px] text-muted-foreground", className)} {...props} />;
}

function CardContent({ className, ref, ...props }: React.ComponentPropsWithRef<"div">) {
  return <div ref={ref} className={cn("p-0", className)} {...props} />;
}

function CardFooter({ className, ref, ...props }: React.ComponentPropsWithRef<"div">) {
  return <div ref={ref} className={cn("flex items-center p-0", className)} {...props} />;
}

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
