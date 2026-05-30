import { Link } from "@tanstack/react-router";

import { dynamicTo } from "@shared/utils/navigation";

import { ROUTES } from "@/shared/constants/routes";

export function HeroActions({ serviceName }: { serviceName: string }) {
  const deploysHref = `${ROUTES.serviceDetail.replace(
    "$serviceName",
    encodeURIComponent(serviceName)
  )}?tab=deploys`;
  return (
    <div className="flex shrink-0 items-center gap-2">
      <Link
        to={dynamicTo(deploysHref)}
        className="inline-flex h-9 items-center rounded-[var(--card-radius)] border border-transparent bg-primary px-3.5 font-medium text-[13px] text-white shadow-[var(--shadow-sm)] transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_oklch,var(--color-primary),transparent_65%)]"
      >
        Deploy
      </Link>
    </div>
  );
}
