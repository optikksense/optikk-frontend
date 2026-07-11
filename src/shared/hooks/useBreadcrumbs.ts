import { useLocation } from "@tanstack/react-router";

import { getDomainNavigationItems } from "@/app/registry/domainRegistry";
import { ROUTES } from "@/shared/constants/routes";

import type { BreadcrumbItem } from "@shared/components/primitives/ui/breadcrumb";

function formatSegmentLabel(segment: string): string {
  return segment.replace(/[-_]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

interface BreadcrumbRule {
  match: (pathname: string, segments: string[]) => boolean;
  build: (segments: string[], navLookup: Map<string, string>) => BreadcrumbItem[];
}

const BREADCRUMB_RULES: BreadcrumbRule[] = [
  {
    match: (pathname) => pathname === ROUTES.traceCompare,
    build: (_, navLookup) => [
      { label: navLookup.get(ROUTES.traces) ?? "Traces", path: ROUTES.traces },
      { label: "Compare" },
    ],
  },
  {
    match: (pathname, segments) =>
      pathname.startsWith("/traces/") && segments.length === 2 && segments[1] !== "compare",
    build: (segments, navLookup) => [
      { label: navLookup.get(ROUTES.traces) ?? "Traces", path: ROUTES.traces },
      { label: segments[1] },
    ],
  },
  {
    match: (pathname, segments) =>
      pathname.startsWith("/saturation/kafka/topics/") && segments.length === 4,
    build: (segments, navLookup) => [
      { label: navLookup.get(ROUTES.saturation) ?? "Saturation", path: ROUTES.saturation },
      { label: "Kafka", path: ROUTES.saturation },
      { label: segments[3] },
    ],
  },
  {
    match: (pathname, segments) =>
      pathname.startsWith("/saturation/kafka/groups/") && segments.length === 4,
    build: (segments, navLookup) => [
      { label: navLookup.get(ROUTES.saturation) ?? "Saturation", path: ROUTES.saturation },
      { label: "Kafka", path: ROUTES.saturation },
      { label: "Consumer Groups" },
      { label: segments[3] },
    ],
  },
  {
    match: (pathname, segments) =>
      pathname.startsWith("/saturation/database/query/") && segments.length === 4,
    build: (segments, navLookup) => [
      { label: navLookup.get(ROUTES.saturation) ?? "Saturation", path: ROUTES.saturation },
      { label: "Database", path: ROUTES.saturationDatabase },
      { label: `Query #${segments[3].slice(0, 6)}` },
    ],
  },
  {
    match: (pathname, segments) =>
      pathname.startsWith("/saturation/datastores/") && segments.length === 3,
    build: (segments, navLookup) => [
      { label: navLookup.get(ROUTES.saturation) ?? "Saturation", path: ROUTES.saturation },
      { label: "Data Stores", path: ROUTES.saturation },
      { label: segments[2] },
    ],
  },
];

function buildDynamicCrumbs(pathname: string): BreadcrumbItem[] {
  const navLookup = new Map(
    getDomainNavigationItems().map((entry) => [entry.path, entry.label] as const)
  );

  const rootCrumbs: BreadcrumbItem[] = [];
  const segments = pathname.split("/").filter(Boolean);

  const rule = BREADCRUMB_RULES.find((r) => r.match(pathname, segments));
  if (rule) {
    return rule.build(segments, navLookup);
  }

  const directNav = getDomainNavigationItems().find((entry) => entry.path === pathname);
  if (directNav) {
    rootCrumbs.push({ label: directNav.label, path: directNav.path });
    return rootCrumbs;
  }

  if (segments.length === 0) {
    return rootCrumbs;
  }

  let currentPath = "";
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
