import { cn } from "@/lib/utils";
import { Breadcrumbs } from "@shared/components/primitives/ui/breadcrumb";
import { useBreadcrumbs } from "@shared/hooks/useBreadcrumbs";
import { Link } from "@tanstack/react-router";
import React from "react";

interface PageHeaderBreadcrumb {
  label: React.ReactNode;
  path?: string;
}

interface PageHeaderProps {
  title: React.ReactNode;
  icon?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  breadcrumbs?: PageHeaderBreadcrumb[];
  /** Auto-generate breadcrumbs from current route (overrides manual breadcrumbs) */
  autoBreadcrumbs?: boolean;
  className?: string;
}

export default function PageHeader({
  title,
  icon,
  subtitle,
  actions,
  breadcrumbs = [],
  autoBreadcrumbs = true,
  className,
}: PageHeaderProps) {
  const routeCrumbs = useBreadcrumbs();

  const showAutoCrumbs = autoBreadcrumbs && breadcrumbs.length === 0 && routeCrumbs.length > 1;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {showAutoCrumbs && (
        <Breadcrumbs items={routeCrumbs} className="text-[11px] text-[var(--text-muted)]" />
      )}
      {breadcrumbs.length > 0 && (
        <div className="flex items-center gap-1 text-[11px]">
          {breadcrumbs.map((breadcrumb, index) => (
            <React.Fragment key={`${String(breadcrumb.label)}-${index}`}>
              {index > 0 ? <span className="text-[var(--text-muted)] opacity-50">/</span> : null}
              {breadcrumb.path ? (
                <Link
                  to={breadcrumb.path}
                  className="font-medium text-[var(--text-muted)] no-underline transition-colors hover:text-[var(--color-primary)]"
                >
                  {breadcrumb.label}
                </Link>
              ) : (
                <span className="font-medium text-[var(--text-secondary)]">{breadcrumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </div>
      )}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          {icon && (
            <div className="mt-0.5 flex items-center text-[var(--text-secondary)]">{icon}</div>
          )}
          <div className="min-w-0">
            <h1 className="m-0 font-semibold text-[1.625rem] text-[var(--text-primary)] leading-[1.15] tracking-[-0.02em]">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1 max-w-3xl text-[13px] text-[var(--text-secondary)] leading-6">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
