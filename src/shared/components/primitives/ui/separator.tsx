import { cn } from "@/lib/utils";

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

export function Separator({ orientation = "horizontal", className, ...props }: SeparatorProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "shrink-0 bg-[var(--border-color)]",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className
      )}
      {...props}
    />
  );
}
