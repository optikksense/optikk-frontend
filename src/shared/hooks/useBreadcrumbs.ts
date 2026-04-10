import { useLocation } from "@tanstack/react-router";

import { getDomainNavigationItems } from "@/app/registry/domainRegistry";
import { ROUTES } from "@/shared/constants/routes";

import type { BreadcrumbItem } from "@/components/ui/breadcrumb";

function formatSegmentLabel(segment: string): string {
  return segment.replace(/[-_]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function buildDynamicCrumbs(pathname: string): BreadcrumbItem[] {
  const navLookup = new Map(
    getDomainNavigationItems().map((entry) => [entry.path, entry.label] as const)
  );

  const rootCrumbs: BreadcrumbItem[] = [];
  const segments = pathname.split("/").filter(Boolean);

  if (pathname === ROUTES.traceCompare) {
    return [
      { label: navLookup.get(ROUTES.traces) ?? "Traces", path: ROUTES.traces },
      { label: "Compare" },
    ];
  }

  if (pathname.startsWith("/traces/") && segments.length === 2 && segments[1] !== "compare") {
    return [
      { label: navLookup.get(ROUTES.traces) ?? "Traces", path: ROUTES.traces },
      { label: segments[1] },
    ];
  }

  if (pathname.startsWith("/saturation/kafka/topics/") && segments.length === 4) {
    return [
      { label: navLookup.get(ROUTES.saturation) ?? "Saturation", path: ROUTES.saturation },
      { label: "Kafka", path: ROUTES.saturation },
      { label: segments[3] },
    ];
  }

  if (pathname.startsWith("/saturation/kafka/groups/") && segments.length === 4) {
    return [
      { label: navLookup.get(ROUTES.saturation) ?? "Saturation", path: ROUTES.saturation },
      { label: "Kafka", path: ROUTES.saturation },
      { label: "Consumer Groups" },
      { label: segments[3] },
    ];
  }

  if (pathname.startsWith("/saturation/datastores/") && segments.length === 3) {
    return [
      { label: navLookup.get(ROUTES.saturation) ?? "Saturation", path: ROUTES.saturation },
      { label: "Data Stores", path: ROUTES.saturation },
      { label: segments[2] },
    ];
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
