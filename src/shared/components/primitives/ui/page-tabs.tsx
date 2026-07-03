import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

interface PageTabItem {
  readonly key: string;
  readonly label: string;
  readonly to?: string;
  readonly count?: number;
  readonly disabled?: boolean;
}

export interface PageTabsProps {
  readonly items: readonly PageTabItem[];
  readonly activeKey: string;
  readonly onChange?: (key: string) => void;
  readonly className?: string;
}

const TAB_BASE =
  "relative inline-flex h-9 items-center gap-1.5 px-3 text-[12px] font-medium leading-none transition-colors";
const TAB_INACTIVE = "text-foreground-secondary hover:text-foreground";
const TAB_ACTIVE = "text-foreground";
const TAB_DISABLED = "text-foreground-muted cursor-not-allowed opacity-60";

export function PageTabs({ items, activeKey, onChange, className }: PageTabsProps) {
  return (
    <div role="tablist" className={cn("flex items-center gap-0 border-border border-b", className)}>
      {items.map((item) => {
        const isActive = item.key === activeKey;
        const content = (
          <>
            <span>{item.label}</span>
            {typeof item.count === "number" ? (
              <span
                className={cn(
                  "rounded-full px-1.5 py-[1px] font-mono text-[10px] leading-none",
                  isActive
                    ? "bg-[var(--color-primary-subtle-14)] text-primary"
                    : "bg-muted text-foreground-muted"
                )}
              >
                {item.count}
              </span>
            ) : null}
            {isActive ? (
              <span
                aria-hidden
                className="-bottom-px absolute right-0 left-0 h-[2px] rounded-t-[1px] bg-[var(--tab-underline)]"
              />
            ) : null}
          </>
        );

        const cls = cn(
          TAB_BASE,
          item.disabled ? TAB_DISABLED : isActive ? TAB_ACTIVE : TAB_INACTIVE
        );

        if (item.to && !item.disabled) {
          return (
            <Link
              key={item.key}
              to={item.to}
              role="tab"
              aria-selected={isActive}
              className={cls}
              onClick={() => onChange?.(item.key)}
            >
              {content}
            </Link>
          );
        }

        return (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            disabled={item.disabled}
            onClick={() => !item.disabled && onChange?.(item.key)}
            className={cls}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}
