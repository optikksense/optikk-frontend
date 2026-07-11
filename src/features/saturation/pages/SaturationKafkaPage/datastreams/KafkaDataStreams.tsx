import { useMemo, useState } from "react";

import type { KafkaTopology, TopicNode } from "@/features/saturation/api/kafkaTopologySchemas";

import { useKafkaTopology } from "../hooks/useKafkaTopology";
import { KafkaGroupDrawer } from "./KafkaGroupDrawer";
import { KafkaPathwaysTable } from "./KafkaPathwaysTable";
import { KafkaServicesTable } from "./KafkaServicesTable";
import { type GroupSelection, KafkaTopicDrawer } from "./KafkaTopicDrawer";
import { KafkaTopicsTable } from "./KafkaTopicsTable";
import { KafkaTopology as TopologyMap } from "./KafkaTopology";
import { ServiceMultiSelect } from "./ServiceMultiSelect";
import { type Level, deriveServices, fmtPct, fmtRate, levelFromError } from "./model";

const LV_COLOR: Record<Level, string> = { ok: "var(--ok)", warn: "var(--warn)", err: "var(--err)" };

type TabId = "topology" | "services" | "topics" | "consumers";

const EMPTY: KafkaTopology = { producers: [], topics: [], consumers: [], edges: [], pathways: [] };

export function KafkaDataStreams() {
  const { data, isLoading } = useKafkaTopology();
  const topo = data ?? EMPTY;
  const services = useMemo(() => deriveServices(topo), [topo]);

  const [tab, setTab] = useState<TabId>("topology");
  const [selected, setSelected] = useState<string[]>([]);
  const [openTopic, setOpenTopic] = useState<TopicNode | null>(null);
  const [openGroup, setOpenGroup] = useState<GroupSelection | null>(null);

  const effectiveSel = selected.length > 0 ? selected : services[0] ? [services[0].id] : [];

  const toggleSvc = (id: string) =>
    setSelected((prev) => {
      const base = prev.length > 0 ? prev : effectiveSel;
      if (base.includes(id)) return base.length > 1 ? base.filter((x) => x !== id) : base;
      return [...base, id];
    });
  const focusSvc = (id: string) => setSelected([id]);

  const scopeTopics = useMemo(() => {
    const s = new Set<string>();
    const selSet = new Set(effectiveSel);
    for (const e of topo.edges) {
      if (e.kind === "produce" && selSet.has(e.source)) s.add(e.target);
      if (e.kind === "consume" && selSet.has(e.target)) s.add(e.source);
    }
    return s;
  }, [topo, effectiveSel]);

  const pathways = useMemo(
    () =>
      topo.pathways
        .filter((p) => effectiveSel.includes(p.producer) || effectiveSel.includes(p.consumer))
        .sort(
          (a, b) => b.error_rate - a.error_rate || b.consume_rate_per_sec - a.consume_rate_per_sec
        ),
    [topo, effectiveSel]
  );

  const scopeTopicNodes = topo.topics.filter((t) => scopeTopics.has(t.topic));
  const kpis = {
    msgsIn: scopeTopicNodes.reduce((a, t) => a + t.rate_per_sec, 0),
    topics: scopeTopicNodes.length,
    maxErr: pathways.reduce((a, p) => Math.max(a, p.error_rate), 0),
  };
  const scopeLabel = effectiveSel.length === 1 ? effectiveSel[0] : `${effectiveSel.length} clients`;

  const TABS: { id: TabId; label: string; badge?: number }[] = [
    { id: "topology", label: "Topology" },
    { id: "services", label: "Services", badge: services.length },
    { id: "topics", label: "Topics", badge: topo.topics.length },
    { id: "consumers", label: "Consumer groups", badge: topo.pathways.length },
  ];

  if (isLoading)
    return <div className="p-6 text-[13px] text-[var(--fg-3)]">Loading data streams…</div>;
  if (services.length === 0)
    return (
      <div className="p-6 text-[13px] text-[var(--fg-3)]">
        No Kafka producer/consumer telemetry in range. Instrument clients with messaging spans to
        populate the topology.
      </div>
    );

  return (
    <div className="flex flex-col gap-4">
      <div className="card flex flex-wrap items-center gap-2.5 p-[10px_12px]">
        <span className="font-semibold text-[10.5px] text-[var(--fg-3)] uppercase tracking-[0.06em]">
          Client
        </span>
        <ServiceMultiSelect options={services} selected={effectiveSel} onToggle={toggleSvc} />
      </div>

      <nav className="flex border-[var(--line)] border-b">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="flex items-center gap-1 border-b-2 px-3 py-2 text-[13px] transition-colors"
            style={{
              borderColor: tab === t.id ? "var(--brand)" : "transparent",
              color: tab === t.id ? "var(--fg-0)" : "var(--fg-3)",
            }}
          >
            {t.label}
            {t.badge != null && (
              <span className="ml-1 inline-flex h-4 min-w-[18px] items-center justify-center rounded-full bg-[var(--bg-2)] px-1 text-[10px] text-[var(--fg-3)]">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="grid grid-cols-3 gap-4">
        <KpiCard label={`Msgs in · ${scopeLabel}`} value={fmtRate(kpis.msgsIn)} unit="/sec" />
        <KpiCard label="Active topics" value={String(kpis.topics)} unit="in scope" />
        <KpiCard
          label="Max error rate"
          value={fmtPct(kpis.maxErr)}
          unit="pathways"
          tone={levelFromError(kpis.maxErr)}
        />
      </div>

      {tab === "topology" && (
        <>
          <div className="card card-pad-lg">
            <div className="mb-2 font-semibold text-[14px] text-[var(--fg-0)]">
              Data streams topology · {scopeLabel}
            </div>
            <TopologyMap
              topo={topo}
              selected={effectiveSel}
              onToggleService={toggleSvc}
              onOpenTopic={setOpenTopic}
            />
          </div>

          <div className="card card-pad-lg">
            <div className="mb-2 font-semibold text-[14px] text-[var(--fg-0)]">
              Pathways · {scopeLabel}
              <span className="ml-2 font-normal text-[12px] text-[var(--fg-3)]">
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
        <div className="card card-pad-lg">
          <div className="mb-2 font-semibold text-[14px] text-[var(--fg-0)]">
            Clients · producing &amp; consuming
          </div>
          <KafkaServicesTable
            services={services}
            onServiceClick={(id) => {
              focusSvc(id);
              setTab("topology");
            }}
          />
        </div>
      )}

      {tab === "topics" && (
        <div className="card card-pad-lg">
          <div className="mb-2 font-semibold text-[14px] text-[var(--fg-0)]">
            Topics · {scopeLabel}
          </div>
          <KafkaTopicsTable topics={scopeTopicNodes} onTopicClick={setOpenTopic} />
        </div>
      )}

      {tab === "consumers" && (
        <div className="card card-pad-lg">
          <div className="mb-2 font-semibold text-[14px] text-[var(--fg-0)]">
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
}: { label: string; value: string; unit: string; tone?: Level }) {
  return (
    <div className="card">
      <div className="text-[13px] text-[var(--fg-3)]">{label}</div>
      <div className="mt-1.5 flex items-baseline gap-1.5">
        <div
          className="font-semibold text-[24px] text-[var(--fg-0)] tabular-nums"
          style={tone ? { color: LV_COLOR[tone] } : undefined}
        >
          {value}
        </div>
        <div className="text-[12px] text-[var(--fg-3)]">{unit}</div>
      </div>
    </div>
  );
}
