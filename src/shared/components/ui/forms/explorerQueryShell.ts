import { cn } from "@/lib/utils";

export const EXPLORER_QUERY_WRAPPER_CLASSNAME = "relative z-[80] w-full overflow-visible";

export const EXPLORER_QUERY_SURFACE_CLASSNAME = cn(
  "rounded-[14px] border border-[var(--glass-border)] bg-[var(--glass-bg)]",
  "shadow-[var(--shadow-md)] backdrop-blur-xl",
  "transition-all duration-150 ease-out",
  "focus-within:border-primary focus-within:shadow-[0_0_0_1px_var(--color-primary)]"
);

export const EXPLORER_QUERY_INNER_ROW_CLASSNAME = cn(
  "flex min-h-[48px] items-center gap-2.5 rounded-[14px] px-3.5 py-2 text-[13px] text-foreground",
  "placeholder:text-foreground-muted"
);

export const EXPLORER_QUERY_ICON_CLASSNAME =
  "shrink-0 text-foreground-muted transition-colors duration-150 group-focus-within:text-info";

export const EXPLORER_QUERY_DROPDOWN_CLASSNAME = cn(
  "absolute top-[calc(100%+8px)] right-0 left-0 z-[320] overflow-hidden rounded-[14px]",
  "border border-[var(--glass-border)] bg-surface-overlay",
  "shadow-[var(--shadow-lg)] backdrop-blur-xl"
);
export const EXPLORER_QUERY_HINTS_CLASSNAME = cn(
  "absolute top-[calc(100%+8px)] right-0 z-[340] min-w-[240px] animate-oqb-fade-in",
  "flex flex-col gap-[7px] rounded-[14px] border border-[var(--glass-border)]",
  "bg-surface-overlay px-3.5 py-2.5 shadow-[var(--shadow-lg)] backdrop-blur-xl"
);
