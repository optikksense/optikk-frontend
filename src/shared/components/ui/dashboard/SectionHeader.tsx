import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';

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
      <div className="mb-[var(--space-sm)] flex items-center border-b border-[var(--border-light)] pb-[var(--space-2xs)]">
        <span className="text-[12px] font-semibold tracking-[0.01em] text-[var(--text-secondary)]">
          {title}
        </span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      className="mb-[var(--space-sm)] flex w-full items-center gap-[var(--space-xs)] border-none border-b border-[var(--border-light)] bg-transparent pb-[var(--space-2xs)] text-left"
    >
      <ChevronDown
        size={14}
        className={cn(
          'shrink-0 text-[var(--text-muted)] transition-transform duration-150',
          collapsed && '-rotate-90',
        )}
      />
      <span className="text-[12px] font-semibold tracking-[0.01em] text-[var(--text-secondary)]">
        {title}
      </span>
    </button>
  );
}
