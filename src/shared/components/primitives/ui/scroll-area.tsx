import { cn } from "@/lib/utils";

export interface ScrollAreaProps extends React.ComponentPropsWithRef<"div"> {}

function ScrollArea({ className, ref, ...props }: ScrollAreaProps) {
  return <div ref={ref} className={cn("overflow-auto", className)} {...props} />;
}

function ScrollBar({ className, ref, ...props }: React.ComponentPropsWithRef<"div">) {
  return <div ref={ref} className={cn("hidden", className)} {...props} />;
}

export { ScrollArea, ScrollBar };
