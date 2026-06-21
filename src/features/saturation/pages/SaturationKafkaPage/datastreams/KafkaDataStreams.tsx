import { ChevronRight, Server } from "lucide-react";
import { useMemo, useState } from "react";

import type { KafkaTopology, TopicNode } from "@/features/saturation/api/kafkaTopologySchemas";
import { SAT_TABLE_CLASS } from "@/features/saturation/pages/SaturationPage/components/tableClasses";

import { useKafkaTopology } from "../hooks/useKafkaTopology";
import { KafkaGroupDrawer } from "./KafkaGroupDrawer";
import { type GroupSelection, KafkaTopicDrawer } from "./KafkaTopicDrawer";
import { KafkaTopology as TopologyMap } from "./KafkaTopology";
import { ServiceMultiSelect } from "./ServiceMultiSelect";
import { LEVEL_LABEL, type Level, deriveServices, fmtPct, fmtRate, levelFromError } from "./model";

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

  // Default selection = first client, applied once data arrives.
  const effectiveSel = selected.length > 0 ? selected : services[0] ? [services[0].id] : [];
  const selSet = new Set(effectiveSel);

  const toggleSvc = (id: string) =>
    setSelected((prev) => {
      const base = prev.length > 0 ? prev : effectiveSel;
      if (base.includes(id)) return base.length > 1 ? base.filter((x) => x !== id) : base;
      return [...base, id];
    });
  const focusSvc = (id: string) => setSelected([id]);

  const scopeTopics = useMemo(() => {
    const s = new Set<string>();
    for (const e of topo.edges) {
      if (e.kind === "produce" && selSet.has(e.source)) s.add(e.target);
      if (e.kind === "consume" && selSet.has(e.target)) s.add(e.source);
    }
    return s;
  }, [topo, effectiveSel.join(",")]);

  const pathways = useMemo(
    () =>
      topo.pathways
        .filter((p) => selSet.has(p.producer) || selSet.has(p.consumer))
        .sort(
          (a, b) => b.error_rate - a.error_rate || b.consume_rate_per_sec - a.consume_rate_per_sec
        ),
    [topo, effectiveSel.join(",")]
  );

  const scopeTopicNodes = topo.topics.filter((t) => scopeTopics.has(t.topic));
  const kpis = {
    msgsIn: scopeTopicNodes.reduce((a, t) => a + t.rate_per_sec, 0),
    topics: scopeTopicNodes.length,
    maxErr: pathways.reduce((a, p) => Math.max(a, p.error_rate), 0),
  };
  const scopeLabel = effectiveSel.length === 1 ? effectiveSel[0] : `${effectiveSel.length} clients`;

  if (isLoading)
    return <div className="p-6 text-[13px] text-[var(--fg-3)]">Loading data streams…</div>;
  if (services.length === 0)
    return (
      <div className="p-6 text-[13px] text-[var(--fg-3)]">
        No Kafka producer/consumer telemetry in range. Instrument clients with messaging spans to
        populate the topology.
      </div>
    );

  const TABS: { id: TabId; label: string; badge?: number }[] = [
    { id: "topology", label: "Topology" },
    { id: "services", label: "Services", badge: services.length },
    { id: "topics", label: "Topics", badge: topo.topics.length },
    { id: "consumers", label: "Consumer groups", badge: topo.pathways.length },
  ];

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
            <table className={SAT_TABLE_CLASS}>
              <thead>
                <tr>
                  <th>Producer</th>
                  <th>Topic</th>
                  <th>Consumer group</th>
                  <th className="num">Msg/s</th>
                  <th className="num">Err</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {pathways.map((r, i) => {
                  const lv = levelFromError(r.error_rate);
                  return (
                    <tr
                      key={i}
                      className={lv === "err" ? "is-err" : lv === "warn" ? "is-warn" : undefined}
                      onClick={() =>
                        setOpenGroup({
                          group: r.group,
                          consumer: r.consumer,
                          topic: r.topic,
                          level: lv,
                        })
                      }
                    >
                      <td className="strong">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            focusSvc(r.producer);
                          }}
                        >
                          {r.producer}
                        </button>
                      </td>
                      <td>{r.topic}</td>
                      <td>
                        <span
                          className="mr-1.5 inline-block h-[7px] w-[7px] rounded-full align-middle"
                          style={{ background: LV_COLOR[lv] }}
                        />
                        {r.group} <span className="text-[var(--fg-3)]">· {r.consumer}</span>
                      </td>
                      <td className="num">{fmtRate(r.consume_rate_per_sec)}</td>
                      <td className="num" style={{ color: LV_COLOR[lv] }}>
                        {fmtPct(r.error_rate)}
                      </td>
                      <td>
                        <ChevronRight size={14} className="text-[var(--fg-3)]" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === "services" && (
        <div className="card card-pad-lg">
          <div className="mb-2 font-semibold text-[14px] text-[var(--fg-0)]">
            Clients · producing &amp; consuming
          </div>
          <table className={SAT_TABLE_CLASS}>
            <thead>
              <tr>
                <th>Service</th>
                <th>Role</th>
                <th>Produces to</th>
                <th>Consumes from</th>
                <th className="num">Throughput</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {services
                .slice()
                .sort((a, b) => b.rate - a.rate)
                .map((s) => {
                  const role =
                    s.produces.length && s.consumes.length
                      ? "producer + consumer"
                      : s.produces.length
                        ? "producer"
                        : "consumer";
                  return (
                    <tr
                      key={s.id}
                      onClick={() => {
                        focusSvc(s.id);
                        setTab("topology");
                      }}
                    >
                      <td className="strong">
                        <span className="mr-2 inline-flex h-[18px] w-[18px] items-center justify-center rounded-[5px] bg-[var(--brand-tint)] align-middle text-[var(--brand)]">
                          <Server size={11} />
                        </span>
                        {s.id}
                      </td>
                      <td className="dim">{role}</td>
                      <td className="dim">{s.produces.map((p) => p.topic).join(", ") || "—"}</td>
                      <td className="dim">{s.consumes.map((c) => c.topic).join(", ") || "—"}</td>
                      <td className="num">{fmtRate(s.rate)}/s</td>
                      <td>
                        <span className={`badge ${s.status}`}>
                          <span className="b-dot" />
                          {LEVEL_LABEL[s.status]}
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}

      {tab === "topics" && (
        <div className="card card-pad-lg">
          <div className="mb-2 font-semibold text-[14px] text-[var(--fg-0)]">
            Topics · {scopeLabel}
          </div>
          <table className={SAT_TABLE_CLASS}>
            <thead>
              <tr>
                <th>Topic</th>
                <th className="num">Producers</th>
                <th className="num">Groups</th>
                <th className="num">Msg/s</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {topo.topics
                .filter((t) => scopeTopics.has(t.topic))
                .map((t) => (
                  <tr key={t.topic} onClick={() => setOpenTopic(t)}>
                    <td className="strong">{t.topic}</td>
                    <td className="num">{t.producer_count}</td>
                    <td className="num">{t.consumer_group_count}</td>
                    <td className="num">{fmtRate(t.rate_per_sec)}</td>
                    <td>
                      <ChevronRight size={14} className="text-[var(--fg-3)]" />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "consumers" && (
        <div className="card card-pad-lg">
          <div className="mb-2 font-semibold text-[14px] text-[var(--fg-0)]">
            Consumer groups · {scopeLabel}
          </div>
          <table className={SAT_TABLE_CLASS}>
            <thead>
              <tr>
                <th>Consumer group</th>
                <th>Service</th>
                <th>Reads topic</th>
                <th className="num">Msg/s</th>
                <th className="num">Err</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {pathways.map((r, i) => {
                const lv = levelFromError(r.error_rate);
                return (
                  <tr
                    key={i}
                    className={lv === "err" ? "is-err" : lv === "warn" ? "is-warn" : undefined}
                    onClick={() =>
                      setOpenGroup({
                        group: r.group,
                        consumer: r.consumer,
                        topic: r.topic,
                        level: lv,
                      })
                    }
                  >
                    <td className="strong">
                      <span
                        className="mr-1.5 inline-block h-[7px] w-[7px] rounded-full align-middle"
                        style={{ background: LV_COLOR[lv] }}
                      />
                      {r.group}
                    </td>
                    <td className="dim">{r.consumer}</td>
                    <td className="dim">{r.topic}</td>
                    <td className="num">{fmtRate(r.consume_rate_per_sec)}</td>
                    <td className="num" style={{ color: LV_COLOR[lv] }}>
                      {fmtPct(r.error_rate)}
                    </td>
                    <td>
                      <ChevronRight size={14} className="text-[var(--fg-3)]" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
