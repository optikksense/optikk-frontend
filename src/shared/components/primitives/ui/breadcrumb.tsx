import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: React.ReactNode;
  path?: string;
}

interface BreadcrumbsProps {
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
        "flex flex-wrap items-center gap-1 text-[11px] text-foreground-secondary",
        className
      )}
    >
      {items.map((item, index) => (
        <span key={`${String(item.label)}-${index}`} className="inline-flex items-center gap-1">
          {index > 0 ? <ChevronRight size={12} className="text-foreground-muted" /> : null}
          {item.path ? (
            <Link
              to={item.path}
              className="font-medium text-foreground-muted transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-foreground-secondary">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

function BreadcrumbItemNode({ className, ...props }: React.LiHTMLAttributes<HTMLLIElement>) {
  return <li className={cn("inline-flex items-center gap-1", className)} {...props} />;
}

export { BreadcrumbItemNode as BreadcrumbItem, Breadcrumbs };
