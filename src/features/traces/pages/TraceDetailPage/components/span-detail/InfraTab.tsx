import { memo, useMemo } from "react";

interface Props {
  readonly resourceAttributes: Record<string, string>;
}

interface Field {
  readonly label: string;
  readonly value: string;
}

const HOST_KEYS = [
  "host.name",
  "host.hostname",
  "net.host.name",
  "host.id",
  "host.arch",
  "os.type",
  "os.description",
];
const K8S_KEYS = [
  "k8s.cluster.name",
  "k8s.namespace.name",
  "k8s.deployment.name",
  "k8s.pod.name",
  "k8s.pod.uid",
  "k8s.node.name",
  "k8s.container.name",
];
const CLOUD_KEYS = [
  "cloud.provider",
  "cloud.region",
  "cloud.availability_zone",
  "cloud.account.id",
  "cloud.platform",
];
const CONTAINER_KEYS = [
  "container.name",
  "container.id",
  "container.image.name",
  "container.image.tag",
];
const SERVICE_KEYS = [
  "service.name",
  "service.version",
  "service.namespace",
  "service.instance.id",
  "deployment.environment",
];

function pickFields(ra: Record<string, string>, keys: readonly string[]): Field[] {
  const out: Field[] = [];
  for (const k of keys) {
    const v = ra[k];
    if (v) out.push({ label: k, value: v });
  }
  return out;
}

function InfraTabComponent({ resourceAttributes }: Props) {
  const groups = useMemo(
    () => [
      { title: "service", fields: pickFields(resourceAttributes, SERVICE_KEYS) },
      { title: "host", fields: pickFields(resourceAttributes, HOST_KEYS) },
      { title: "container", fields: pickFields(resourceAttributes, CONTAINER_KEYS) },
      { title: "k8s", fields: pickFields(resourceAttributes, K8S_KEYS) },
      { title: "cloud", fields: pickFields(resourceAttributes, CLOUD_KEYS) },
    ],
    [resourceAttributes]
  );

  const hasAny = groups.some((g) => g.fields.length > 0);
  if (!hasAny) {
    return (
      <div className="p-4 flex flex-col gap-4">
        <div className="text-[var(--text-caption)] text-[12px] py-2">
          No infrastructure attributes for this span.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      {groups
        .filter((g) => g.fields.length > 0)
        .map((g) => (
          <div key={g.title} className="flex flex-col gap-2">
            <div className="text-[10.5px] tracking-[0.06em] uppercase text-[var(--text-caption)]">
              {g.title}
            </div>
            <div className="flex flex-col gap-px bg-[var(--border-color)] rounded-md overflow-hidden">
              {g.fields.map((f) => (
                <div
                  key={f.label}
                  className="grid grid-cols-[180px_1fr_auto] gap-2.5 items-center px-2.5 py-1.5 bg-[var(--bg-primary)] text-[12px] hover:bg-[var(--bg-secondary)]"
                >
                  <span className="text-[var(--text-muted)] font-mono text-[11.5px] break-all">
                    {f.label}
                  </span>
                  <span
                    className="text-[var(--text-primary)] font-mono text-[11.5px] overflow-hidden text-ellipsis whitespace-nowrap"
                    title={f.value}
                  >
                    {f.value}
                  </span>
                  <span />
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}

export const InfraTab = memo(InfraTabComponent);
