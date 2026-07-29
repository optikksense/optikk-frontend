import { SectionCard } from "@shared/components/ui/layout/SectionCard";

import type { HostAbout } from "../../api/hostDetailApi";

interface HostDetailAboutProps {
  readonly about: HostAbout | undefined;
}

function cloudSummary(about: HostAbout): string | undefined {
  const parts = [about.cloudProvider, about.cloudRegion, about.cloudZone].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : undefined;
}

function buildRows(about: HostAbout): Array<{ label: string; value: string }> {
  const rows: Array<{ label: string; value: string | undefined }> = [
    { label: "OS", value: about.osDescription || about.osType },
    { label: "Architecture", value: about.arch },
    { label: "Cloud", value: cloudSummary(about) },
    { label: "Platform", value: about.cloudPlatform },
    { label: "Instance ID", value: about.hostId },
    { label: "K8s node", value: about.k8sNodeName },
  ];
  return rows.filter((r): r is { label: string; value: string } => Boolean(r.value));
}

export function HostDetailAbout({ about }: HostDetailAboutProps) {
  if (!about) return null;
  const rows = buildRows(about);
  if (rows.length === 0) return null;
  return (
    <SectionCard title="About this host">
      <dl className="grid grid-cols-1 gap-x-8 gap-y-2 text-[12px] sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((row) => (
          <div key={row.label} className="flex items-baseline justify-between gap-3">
            <dt className="shrink-0 text-foreground-muted">{row.label}</dt>
            <dd className="truncate text-right font-medium text-foreground" title={row.value}>
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </SectionCard>
  );
}
