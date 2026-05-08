import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  readonly icon?: LucideIcon;
  readonly title: string;
  readonly description?: string;
  readonly action?: React.ReactNode;
  readonly className?: string;
  readonly compact?: boolean;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center text-center",
        compact ? "gap-2 py-6" : "gap-3 py-12",
        className
      )}
    >
      <span
        className={cn(
          "flex items-center justify-center rounded-full",
          compact ? "h-8 w-8" : "h-12 w-12",
          "bg-[var(--color-primary-subtle-08)] text-[var(--color-primary)]"
        )}
      >
        <Icon size={compact ? 16 : 22} strokeWidth={1.75} />
      </span>
      <div className={cn("font-semibold text-[var(--text-primary)]", compact ? "text-[12px]" : "text-[14px]")}>
        {title}
      </div>
      {description ? (
        <div
          className={cn(
            "max-w-[420px] text-[var(--text-muted)]",
            compact ? "text-[11px]" : "text-[12px] leading-[1.55]"
          )}
        >
          {description}
        </div>
      ) : null}
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}
