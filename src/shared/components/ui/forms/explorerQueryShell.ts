import { cn } from "@/lib/utils";

export const EXPLORER_QUERY_WRAPPER_CLASSNAME = "relative z-[80] w-full overflow-visible";

export const EXPLORER_QUERY_SURFACE_CLASSNAME = cn(
  "rounded-[14px] border border-[rgba(148,163,184,0.18)] bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(15,23,42,0.78))]",
  "shadow-[0_18px_44px_rgba(2,6,23,0.28),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl",
  "transition-all duration-150 ease-out",
  "focus-within:border-[rgba(96,165,250,0.48)] focus-within:shadow-[0_0_0_1px_rgba(96,165,250,0.2),0_22px_54px_rgba(2,6,23,0.38),inset_0_1px_0_rgba(255,255,255,0.05)]"
);

export const EXPLORER_QUERY_INNER_ROW_CLASSNAME = cn(
  "flex min-h-[48px] items-center gap-2.5 rounded-[14px] px-3.5 py-2 text-[13px] text-[var(--text-primary)]",
  "placeholder:text-[var(--text-muted)]"
);

export const EXPLORER_QUERY_ICON_CLASSNAME =
  "shrink-0 text-[var(--text-muted)] transition-colors duration-150 group-focus-within:text-[var(--color-info)]";

export const EXPLORER_QUERY_DROPDOWN_CLASSNAME = cn(
  "absolute top-[calc(100%+8px)] right-0 left-0 z-[320] overflow-hidden rounded-[14px]",
  "border border-[rgba(148,163,184,0.18)] bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(15,23,42,0.94))]",
  "shadow-[0_28px_60px_rgba(2,6,23,0.55)] backdrop-blur-xl"
);

export const EXPLORER_QUERY_POPOVER_CLASSNAME = cn(
  "z-[320] overflow-hidden rounded-[14px] border border-[rgba(148,163,184,0.18)]",
  "bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(15,23,42,0.94))] shadow-[0_28px_60px_rgba(2,6,23,0.55)] backdrop-blur-xl"
);

export const EXPLORER_QUERY_HINTS_CLASSNAME = cn(
  "absolute top-[calc(100%+8px)] right-0 z-[340] min-w-[240px] animate-oqb-fade-in",
  "flex flex-col gap-[7px] rounded-[14px] border border-[rgba(148,163,184,0.18)]",
  "bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(15,23,42,0.94))] px-3.5 py-2.5 shadow-[0_28px_60px_rgba(2,6,23,0.55)] backdrop-blur-xl"
);
