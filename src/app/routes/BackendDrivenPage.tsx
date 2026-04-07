import { Navigate, useLocation } from '@tanstack/react-router';

import { DashboardPage, PageHeader, PageShell } from '@shared/components/ui';
import { getDashboardIcon } from '@shared/components/ui/dashboard/utils/dashboardUtils';
import { usePagesConfig } from '@shared/hooks/usePagesConfig';

import { resolveDashboardPageAdapter } from '@/app/registry/domainRegistry';
import { Skeleton } from '@/components/ui';
import { ROUTES } from '@/shared/constants/routes';
import type { DefaultConfigPage } from '@/types/dashboardConfig';

function matchConfiguredPage(
  pathname: string,
  pages: readonly DefaultConfigPage[]
): { page: DefaultConfigPage; pathParams?: Record<string, string> } | null {
  for (const page of pages) {
    // Manual simple matching for dynamic backend pages
    const isMatched = pathname === page.path;
    if (!isMatched) {
      continue;
    }

    // Backend pages generally don't have complex params handled here yet,
    // but we can extract them if needed. For now, simple match.
    return { page, pathParams: undefined };
  }

  return null;
}

export default function BackendDrivenPage(): JSX.Element {
  const location = useLocation();
  const { pages, isLoading, error } = usePagesConfig();

  // Still fetching on first load — show skeleton.
  if (isLoading && pages.length === 0) {
    return (
      <div style={{ padding: 24 }}>
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    );
  }

  // Query failed and no cached pages — redirect to root so the app doesn't
  // get stuck on a skeleton indefinitely.
  if (error && pages.length === 0) {
    return <Navigate to={ROUTES.overview} replace />;
  }

  const matched = matchConfiguredPage(location.pathname, pages);
  if (!matched) {
    return <Navigate to={pages[0]?.path || ROUTES.overview} replace />;
  }

  const { page: matchedPage, pathParams } = matched;

  if (matchedPage.renderMode !== 'dashboard') {
    return <Navigate to={matchedPage.path || pages[0]?.path || ROUTES.overview} replace />;
  }

  const registeredAdapter = resolveDashboardPageAdapter(matchedPage.id);
  if (registeredAdapter) {
    const Page = registeredAdapter.page;
    return <Page pathParams={pathParams} />;
  }

  return (
    <PageShell>
      <PageHeader
        title={matchedPage.title || matchedPage.label}
        subtitle={matchedPage.subtitle}
        icon={getDashboardIcon(matchedPage.icon, 24)}
      />
      <DashboardPage pageId={matchedPage.id} pathParams={pathParams} />
    </PageShell>
  );
}
