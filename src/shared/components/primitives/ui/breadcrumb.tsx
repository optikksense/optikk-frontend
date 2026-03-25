import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: React.ReactNode;
  path?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        'flex flex-wrap items-center gap-1 text-[11px] text-[var(--text-secondary)]',
        className,
      )}
    >
      {items.map((item, index) => (
        <span key={`${String(item.label)}-${index}`} className="inline-flex items-center gap-1">
          {index > 0 ? (
            <ChevronRight size={12} className="text-[var(--text-muted)]" />
          ) : null}
          {item.path ? (
            <Link
              to={item.path}
              className="font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--color-primary)]"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-[var(--text-secondary)]">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}

function Breadcrumb({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return <nav className={cn('flex items-center', className)} {...props} />;
}

function BreadcrumbList({
  className,
  ...props
}: React.OlHTMLAttributes<HTMLOListElement>) {
  return (
    <ol className={cn('flex items-center gap-1.5', className)} {...props} />
  );
}

function BreadcrumbItemNode({
  className,
  ...props
}: React.LiHTMLAttributes<HTMLLIElement>) {
  return <li className={cn('inline-flex items-center gap-1', className)} {...props} />;
}

function BreadcrumbPage({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn('font-medium text-foreground', className)} {...props} />;
}

function BreadcrumbSeparator({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn('text-muted-foreground', className)} {...props}>
      {children ?? <ChevronRight size={12} />}
    </span>
  );
}

export {
  Breadcrumb,
  BreadcrumbItemNode as BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Breadcrumbs,
};

export default Breadcrumbs;
