import { useMemo, useState } from "react";

import type { TopicNode } from "@/features/saturation/api/kafkaTopologySchemas";
import { cn } from "@shared/lib/utils";

import { useKafkaClients } from "../hooks/useKafkaClients";
import { useKafkaTopology } from "../hooks/useKafkaTopology";

import { KafkaGroupDrawer } from "./KafkaGroupDrawer";
import { KafkaPathwaysTable } from "./KafkaPathwaysTable";
import { KafkaServicesTable } from "./KafkaServicesTable";
import { type GroupSelection, KafkaTopicDrawer } from "./KafkaTopicDrawer";
import { KafkaTopicsTable } from "./KafkaTopicsTable";
import { KafkaTopology as TopologyMap } from "./KafkaTopology";
import { KafkaDataStreamsSkeleton } from "./KafkaDataStreamsSkeleton";
import { ServiceSelect } from "./ServiceSelect";
import { type Level, deriveServices, fmtPct, fmtRate, levelFromError } from "./model";

type TabId = "topology" | "services" | "topics" | "consumers";

const EMPTY_TOPOLOGY = { producers: [], topics: [], consumers: [], edges: [], pathways: [] };

export function KafkaDataStreams() {
  const { data: clients = [], isLoading: clientsLoading } = useKafkaClients();
  const [selected, setSelected] = useState<string[]>([]);

  // Pure derived state: default to busiest client if user hasn't explicitly picked one
  const selectedClients = useMemo(() => {
    if (selected.length > 0) return selected;
    return clients.length > 0 ? [clients[0]] : [];
  }, [selected, clients]);

  const { data, isLoading: topologyLoading } = useKafkaTopology(selectedClients);
  const topo = data ?? EMPTY_TOPOLOGY;
  const services = useMemo(() => deriveServices(topo), [topo]);

  const [tab, setTab] = useState<TabId>("topology");
  const [openTopic, setOpenTopic] = useState<TopicNode | null>(null);
  const [openGroup, setOpenGroup] = useState<GroupSelection | null>(null);

  const scopeLabel = selectedClients.join(", ");

  const pathways = useMemo(
    () =>
      topo.pathways
        .slice()
        .sort(
          (a, b) => b.error_rate - a.error_rate || b.consume_rate_per_sec - a.consume_rate_per_sec
        ),
    [topo]
  );

  const kpis = useMemo(
    () => ({
      msgsIn: topo.topics.reduce((acc, t) => acc + t.rate_per_sec, 0),
      topics: topo.topics.length,
      maxErr: pathways.reduce((max, p) => Math.max(max, p.error_rate), 0),
    }),
    [topo, pathways]
  );

  const tabs: ReadonlyArray<{ id: TabId; label: string; badge?: number }> = [
    { id: "topology", label: "Topology" },
    { id: "services", label: "Services", badge: services.length },
    { id: "topics", label: "Topics", badge: topo.topics.length },
    { id: "consumers", label: "Consumer groups", badge: topo.pathways.length },
  ];

  const isTopologyLoading = selectedClients.length > 0 && topologyLoading;

  if (clientsLoading || isTopologyLoading) {
    return <KafkaDataStreamsSkeleton />;
  }

  if (clients.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <div className="text-sm font-medium text-foreground">No Kafka Telemetry Found</div>
        <div className="mt-1 text-xs text-foreground-muted">
          No Kafka producer or consumer spans were detected in the selected time window.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Client selector bar */}
      <div className="rounded-lg border border-border bg-card flex flex-wrap items-center gap-2.5 p-3">
        <span className="font-semibold text-[11px] text-foreground-muted uppercase tracking-wider">
          Client
        </span>
        <ServiceSelect options={clients} selected={selectedClients} onChange={setSelected} />
      </div>

      {/* Navigation tabs */}
      <nav className="flex border-b border-border" aria-label="Kafka streams sections">
        {tabs.map((t) => {
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-medium transition-colors",
                isActive
                  ? "border-primary text-foreground font-semibold"
                  : "border-transparent text-foreground-muted hover:text-foreground"
              )}
            >
              {t.label}
              {t.badge != null && (
                <span className="inline-flex h-4 min-w-[18px] items-center justify-center rounded-full bg-muted px-1 text-[10px] text-foreground-muted">
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard label={`Msgs in · ${scopeLabel}`} value={fmtRate(kpis.msgsIn)} unit="/sec" />
        <KpiCard label="Active topics" value={String(kpis.topics)} unit="in scope" />
        <KpiCard
          label="Max error rate"
          value={fmtPct(kpis.maxErr)}
          unit="pathways"
          tone={levelFromError(kpis.maxErr)}
        />
      </div>

      {/* Main Tab Content */}
      {tab === "topology" && (
        <>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="mb-3 font-semibold text-sm text-foreground">
              Data streams topology · {scopeLabel}
            </div>
            <TopologyMap
              topo={topo}
              onSelectService={(id) => setSelected([id])}
              onOpenTopic={setOpenTopic}
            />
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between font-semibold text-sm text-foreground">
              <span>Pathways · {scopeLabel}</span>
              <span className="font-normal text-xs text-foreground-muted">
                {pathways.length} pathways · sorted by error rate
              </span>
            </div>
            <KafkaPathwaysTable
              pathways={pathways}
              variant="topology"
              onRowClick={(r) => {
                const lv = levelFromError(r.error_rate);
                setOpenGroup({ group: r.group, consumer: r.consumer, topic: r.topic, level: lv });
              }}
            />
          </div>
        </>
      )}

      {tab === "services" && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="mb-3 font-semibold text-sm text-foreground">
            Clients · producing &amp; consuming
          </div>
          <KafkaServicesTable
            services={services}
            onServiceClick={(id) => {
              setSelected([id]);
              setTab("topology");
            }}
          />
        </div>
      )}

      {tab === "topics" && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="mb-3 font-semibold text-sm text-foreground">
            Topics · {scopeLabel}
          </div>
          <KafkaTopicsTable topics={topo.topics} onTopicClick={setOpenTopic} />
        </div>
      )}

      {tab === "consumers" && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="mb-3 font-semibold text-sm text-foreground">
            Consumer groups · {scopeLabel}
          </div>
          <KafkaPathwaysTable
            pathways={pathways}
            variant="consumers"
            onRowClick={(r) => {
              const lv = levelFromError(r.error_rate);
              setOpenGroup({ group: r.group, consumer: r.consumer, topic: r.topic, level: lv });
            }}
          />
        </div>
      )}

      {/* Drawers */}
      <KafkaTopicDrawer
        topic={openTopic}
        topo={topo}
        open={openTopic != null}
        onClose={() => setOpenTopic(null)}
        onOpenGroup={(g) => {
          setOpenTopic(null);
          setOpenGroup(g);
        }}
      />
      <KafkaGroupDrawer
        group={openGroup}
        topo={topo}
        open={openGroup != null}
        onClose={() => setOpenGroup(null)}
        onOpenTopic={(t) => {
          setOpenGroup(null);
          setOpenTopic(t);
        }}
      />
    </div>
  );
}

function KpiCard({
  label,
  value,
  unit,
  tone,
}: {
  label: string;
  value: string;
  unit: string;
  tone?: Level;
}) {
  const toneColorClass =
    tone === "err"
      ? "text-destructive"
      : tone === "warn"
        ? "text-warning"
        : tone === "ok"
          ? "text-success"
          : "text-foreground";

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="text-xs text-foreground-muted">{label}</div>
      <div className="mt-1.5 flex items-baseline gap-1.5">
        <div className={cn("font-semibold text-2xl tabular-nums", toneColorClass)}>{value}</div>
        <div className="text-xs text-foreground-muted">{unit}</div>
      </div>
    </div>
  );
}
