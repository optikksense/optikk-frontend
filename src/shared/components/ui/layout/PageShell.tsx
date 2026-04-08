import { Card, type CardProps } from "@/components/ui";
import { cn } from "@/lib/utils";

interface PageShellProps extends React.HTMLAttributes<HTMLDivElement> {}

export function PageShell({ className, children, ...props }: PageShellProps): JSX.Element {
  return (
    <div className={cn("flex flex-col gap-4 pb-5", className)} {...props}>
      {children}
    </div>
  );
}

export interface PageSurfaceProps extends CardProps {}

export function PageSurface({
  className,
  elevation = 1,
  padding = "lg",
  children,
  ...props
}: PageSurfaceProps): JSX.Element {
  return (
    <Card
      elevation={elevation}
      padding={padding}
      className={cn(
        "border-[var(--border-color)] bg-[var(--bg-card)] shadow-[var(--shadow-sm)]",
        className
      )}
      {...props}
    >
      {children}
    </Card>
  );
}
