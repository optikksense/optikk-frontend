import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  collapsible: boolean;
  collapsed: boolean;
  onToggle?: () => void;
}

export default function SectionHeader({
  title,
  collapsible,
  collapsed,
  onToggle,
}: SectionHeaderProps) {
  if (!collapsible) {
    return (
      <div className="mb-[var(--space-xs)] flex items-center border-[var(--border-light)] border-b pb-[var(--space-xs)]">
        <span className="font-semibold text-[13px] text-[var(--text-secondary)] tracking-[0.01em]">
          {title}
        </span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      className="mb-[var(--space-xs)] flex w-full items-center gap-[var(--space-xs)] border-[var(--border-light)] border-b border-none bg-transparent pb-[var(--space-xs)] text-left"
    >
      <ChevronDown
        size={14}
        className={cn(
          "shrink-0 text-[var(--text-muted)] transition-transform duration-150",
          collapsed && "-rotate-90"
        )}
      />
      <span className="font-semibold text-[13px] text-[var(--text-secondary)] tracking-[0.01em]">
        {title}
      </span>
    </button>
  );
}
