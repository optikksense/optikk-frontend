import type { ReactNode } from "react";

import { PageHeader, PageShell, PageSurface } from "@shared/components/ui";
import AiContextBar from "@shared/components/ui/calm/AiContextBar";

import { AiInvestigationDrawer } from "./AiInvestigationDrawer";

interface AiWorkspaceLayoutProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  breadcrumbs?: Array<{
    label: ReactNode;
    path?: string;
  }>;
  topRail?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function AiWorkspaceLayout({
  title,
  subtitle,
  icon,
  actions,
  breadcrumbs,
  topRail,
  children,
  className,
}: AiWorkspaceLayoutProps): JSX.Element {
  return (
    <PageShell className={className}>
      <PageHeader
        title={title}
        subtitle={subtitle}
        icon={icon}
        actions={actions}
        breadcrumbs={breadcrumbs}
      />
      <AiContextBar />
      {topRail ? (
        <PageSurface
          padding="sm"
          className="sticky top-4 z-20 border-[var(--color-primary-subtle-20)] bg-[linear-gradient(180deg,rgba(9,13,26,0.98),rgba(9,13,26,0.92))] backdrop-blur"
        >
          {topRail}
        </PageSurface>
      ) : null}
      {children}
      <AiInvestigationDrawer />
    </PageShell>
  );
}
