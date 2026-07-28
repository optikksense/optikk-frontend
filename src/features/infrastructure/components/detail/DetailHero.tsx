import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { cn } from "@shared/lib/utils";

import { ROUTES } from "@/shared/constants/routes";

interface BreadcrumbSegment {
  readonly label: string;
  readonly mono?: boolean;
  readonly muted?: boolean;
}

// Breadcrumb from the Infrastructure hub down to the current entity.
export function DetailBreadcrumb({ segments }: { segments: readonly BreadcrumbSegment[] }) {
  return (
    <div className="mb-3 flex items-center gap-1.5 text-[12px] text-foreground-muted">
      <Link to={ROUTES.infrastructure} className="hover:text-foreground">
        Infrastructure
      </Link>
      {segments.map((segment) => (
        <span key={segment.label} className="contents">
          <span aria-hidden="true">/</span>
          <span
            className={cn(
              segment.muted ? "text-foreground-secondary" : "text-foreground",
              segment.mono && "font-mono"
            )}
          >
            {segment.label}
          </span>
        </span>
      ))}
    </div>
  );
}

export function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
      <span>{label}</span>
      <strong className="font-medium text-foreground">{value}</strong>
    </span>
  );
}

export function MetaLink({ label, to, value }: { label: string; to: string; value: string }) {
  return (
    <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
      <span>{label}</span>
      <Link to={to as string & {}} className="font-medium font-mono text-primary hover:underline">
        {value}
      </Link>
    </span>
  );
}

export function DetailMetaRow({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1 text-[12px] text-foreground-muted">
      {children}
    </div>
  );
}

interface DetailHeroLayoutProps {
  readonly icon: ReactNode;
  readonly title: string;
  /** Rendered next to the title, e.g. a status pill. */
  readonly badge?: ReactNode;
  /** Meta row(s) rendered below the title. */
  readonly children?: ReactNode;
}

// Icon + title + meta hero layout shared by the host and container detail pages.
export function DetailHeroLayout({ icon, title, badge, children }: DetailHeroLayoutProps) {
  const heading = (
    <h1 className="truncate font-mono font-semibold text-[22px] text-foreground leading-tight">
      {title}
    </h1>
  );
  return (
    <div className="flex flex-wrap items-start gap-3">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-[var(--color-primary-subtle-12)] text-primary">
        {icon}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {badge ? (
          <div className="flex items-center gap-3">
            {heading}
            {badge}
          </div>
        ) : (
          heading
        )}
        {children}
      </div>
    </div>
  );
}
