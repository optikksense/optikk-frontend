import { matchPath, useLocation } from 'react-router-dom';

import { ROUTES } from '@/shared/constants/routes';
import { getDomainNavigationItems } from '@/app/registry/domainRegistry';

import type { BreadcrumbItem } from '@/components/ui/breadcrumb';

function formatSegmentLabel(segment: string): string {
  return segment.replace(/[-_]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function buildDynamicCrumbs(pathname: string): BreadcrumbItem[] {
  const navLookup = new Map(
    getDomainNavigationItems().map((entry) => [entry.path, entry.label] as const)
  );

  const rootCrumbs: BreadcrumbItem[] = [];

  const traceCompareMatch = matchPath({ path: ROUTES.traceCompare, end: true }, pathname);
  if (traceCompareMatch) {
    return [
      { label: navLookup.get(ROUTES.traces) ?? 'Traces', path: ROUTES.traces },
      { label: 'Compare' },
    ];
  }

  const tracesMatch = matchPath({ path: ROUTES.traceDetail, end: true }, pathname);
  if (tracesMatch?.params.traceId) {
    return [
      { label: navLookup.get(ROUTES.traces) ?? 'Traces', path: ROUTES.traces },
      { label: tracesMatch.params.traceId },
    ];
  }

const kafkaTopicMatch = matchPath({ path: ROUTES.kafkaTopicDetail, end: true }, pathname);
  if (kafkaTopicMatch?.params.topic) {
    return [
      { label: navLookup.get(ROUTES.saturation) ?? 'Saturation', path: ROUTES.saturation },
      { label: kafkaTopicMatch.params.topic },
    ];
  }

  const kafkaGroupMatch = matchPath({ path: ROUTES.kafkaGroupDetail, end: true }, pathname);
  if (kafkaGroupMatch?.params.groupId) {
    return [
      { label: navLookup.get(ROUTES.saturation) ?? 'Saturation', path: ROUTES.saturation },
      { label: kafkaGroupMatch.params.groupId },
    ];
  }

  const directNav = getDomainNavigationItems().find((entry) => entry.path === pathname);
  if (directNav) {
    rootCrumbs.push({ label: directNav.label, path: directNav.path });
    return rootCrumbs;
  }

  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) {
    return rootCrumbs;
  }

  let currentPath = '';
  for (const segment of segments) {
    currentPath += `/${segment}`;
    const navEntry = getDomainNavigationItems().find((entry) => entry.path === currentPath);
    rootCrumbs.push({
      label: navEntry?.label ?? formatSegmentLabel(segment),
      path: currentPath === pathname ? undefined : currentPath,
    });
  }

  return rootCrumbs;
}

export function useBreadcrumbs(): BreadcrumbItem[] {
  const location = useLocation();

  return buildDynamicCrumbs(location.pathname);
}
