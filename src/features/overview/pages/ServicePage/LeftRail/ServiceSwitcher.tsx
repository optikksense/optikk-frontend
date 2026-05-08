import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { getServiceMetrics } from "@/features/overview/api/serviceMetricsApi";
import { ROUTES } from "@/shared/constants/routes";
import { dynamicNavigateOptions } from "@/shared/utils/navigation";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

interface ServiceSwitcherProps {
  readonly currentServiceName: string;
}

function buildDetailPath(serviceName: string): string {
  return ROUTES.serviceDetail.replace("$serviceName", encodeURIComponent(serviceName));
}

export default function ServiceSwitcher({ currentServiceName }: ServiceSwitcherProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const servicesQuery = useTimeRangeQuery("service-rail-services", (_teamId, start, end) =>
    getServiceMetrics(start, end)
  );

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const rows = servicesQuery.data ?? [];
    const pool = rows
      .map((row) => String(row.service_name ?? ""))
      .filter((name) => name && name !== currentServiceName);
    if (!needle) return pool.slice(0, 6);
    return pool.filter((name) => name.toLowerCase().includes(needle)).slice(0, 6);
  }, [query, servicesQuery.data, currentServiceName]);

  return (
    <div className="flex flex-col gap-1">
      <div className="px-2 pb-1 text-[10px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
        Services
      </div>
      <label className="relative block">
        <Search
          size={12}
          className="-translate-y-1/2 absolute top-1/2 left-2 text-[var(--text-muted)]"
        />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search services"
          className="w-full rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-tertiary)] py-1.5 pr-2 pl-6 text-[12px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--color-primary)]"
        />
      </label>
      <div className="flex flex-col gap-0.5 pt-1">
        {matches.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => navigate(dynamicNavigateOptions(buildDetailPath(name)))}
            className="truncate rounded-[var(--card-radius)] px-2 py-1 text-left text-[12px] text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
          >
            {name}
          </button>
        ))}
        {matches.length === 0 ? (
          <div className="px-2 py-1 text-[11px] text-[var(--text-muted)]">No matches</div>
        ) : null}
      </div>
    </div>
  );
}
