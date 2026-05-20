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
      <div className="tdp-sd-pane">
        <div className="tdp-muted">No infrastructure attributes for this span.</div>
      </div>
    );
  }

  return (
    <div className="tdp-sd-pane">
      {groups
        .filter((g) => g.fields.length > 0)
        .map((g) => (
          <div key={g.title} className="tdp-sect">
            <div className="tdp-sect-t">{g.title}</div>
            <div className="tdp-attr-list">
              {g.fields.map((f) => (
                <div key={f.label} className="tdp-attr-row">
                  <span className="tdp-attr-k">{f.label}</span>
                  <span className="tdp-attr-v" title={f.value}>
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
