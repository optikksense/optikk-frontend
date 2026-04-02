import { forwardRef } from 'react';

import { cn } from '@/lib/utils';

export type BadgeVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
  color?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-[var(--border-color)]',
  success: 'bg-[rgba(82,135,107,0.15)] text-[var(--color-success)] border-[rgba(82,135,107,0.3)]',
  error: 'bg-[rgba(220,38,38,0.12)] text-[var(--color-error)] border-[rgba(220,38,38,0.3)]',
  warning: 'bg-[rgba(217,119,6,0.12)] text-[var(--color-warning)] border-[rgba(217,119,6,0.3)]',
  info: 'bg-[rgba(77,166,200,0.12)] text-[var(--color-info)] border-[rgba(77,166,200,0.3)]',
};

const colorClasses: Record<string, string> = {
  blue: 'bg-[rgba(107,182,255,0.12)] text-[#6BB6FF] border-[rgba(107,182,255,0.28)]',
  purple:
    'bg-[var(--color-primary-subtle-12)] text-[var(--color-primary)] border-[var(--color-primary-subtle-28)]',
  green: 'bg-[rgba(82,135,107,0.15)] text-[#52876B] border-[rgba(82,135,107,0.3)]',
  red: 'bg-[rgba(220,38,38,0.12)] text-[#DC2626] border-[rgba(220,38,38,0.3)]',
  orange: 'bg-[rgba(217,119,6,0.12)] text-[#D97706] border-[rgba(217,119,6,0.3)]',
  yellow: 'bg-[rgba(245,158,11,0.12)] text-[#F59E0B] border-[rgba(245,158,11,0.3)]',
};

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ variant = 'default', color, className, children, ...props }, ref) => {
    const classes = color
      ? (colorClasses[color] ?? variantClasses.default)
      : variantClasses[variant];

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium leading-none',
          classes,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
