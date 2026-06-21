import { Layers, Server } from "lucide-react";
import type { ReactNode } from "react";

import type {
  TopicNode,
  KafkaTopology as Topo,
} from "@/features/saturation/api/kafkaTopologySchemas";

import { type Level, fmtRate, levelFromError, worst } from "./model";

const LV_COLOR: Record<Level, string> = { ok: "var(--ok)", warn: "var(--warn)", err: "var(--err)" };
const LV_EDGE: Record<Level, string> = {
  ok: "var(--chart-3)",
  warn: "var(--warn)",
  err: "var(--err)",
};

const PROD_X = 16;
const PROD_W = 182;
const TOPIC_X = 456;
const TOPIC_W = 212;
const CONS_X = 922;
const CONS_W = 182;
const NODE_H = 56;
const GAP = 76;
const TOP = 24;
const W = 1120;

interface Props {
  readonly topo: Topo;
  readonly selected: readonly string[];
  readonly onToggleService: (id: string) => void;
  readonly onOpenTopic: (topic: TopicNode) => void;
}

interface NodeBoxProps {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly accent: string;
  readonly onClick: () => void;
  readonly dim: boolean;
  readonly children: ReactNode;
}

function NodeBox({ x, y, w, accent, onClick, dim, children }: NodeBoxProps) {
  return (
    <div
      onClick={onClick}
      className="absolute cursor-pointer rounded-[10px] border bg-[var(--bg-card)] px-[11px] py-[9px] shadow-[var(--shadow-sm)] transition-[opacity,border-color] duration-150"
      style={{
        left: x,
        top: y,
        width: w,
        minHeight: NODE_H,
        borderColor: accent,
        opacity: dim ? 0.32 : 1,
      }}
    >
      {children}
    </div>
  );
}

/** Producers ▸ topics ▸ consumers topology (design `KafkaTopology`). */
export function KafkaTopology({ topo, selected, onToggleService, onOpenTopic }: Props) {
  const selSet = new Set(selected);

  // Topic health from the worst consumer error on that topic.
  const topicLevel = new Map<string, Level>();
  for (const pw of topo.pathways) {
    topicLevel.set(
      pw.topic,
      worst(topicLevel.get(pw.topic) ?? "ok", levelFromError(pw.error_rate))
    );
  }

  // In-scope topics = topics any selected client produces or consumes.
  const scopeTopics = new Set<string>();
  for (const e of topo.edges) {
    if (e.kind === "produce" && selSet.has(e.source)) scopeTopics.add(e.target);
    if (e.kind === "consume" && selSet.has(e.target)) scopeTopics.add(e.source);
  }

  const producers = topo.producers.map((p) => p.service);
  const consumerSvcs = Array.from(new Set(topo.consumers.map((c) => c.service)));
  const topics = topo.topics;

  const yOf = (i: number) => TOP + i * GAP;
  const prodY = new Map(producers.map((s, i) => [s, yOf(i)]));
  const topicY = new Map(topics.map((t, i) => [t.topic, yOf(i)]));
  const consY = new Map(consumerSvcs.map((s, i) => [s, yOf(i)]));
  const rows = Math.max(producers.length, topics.length, consumerSvcs.length, 1);
  const H = TOP + rows * GAP;

  const onTopic = (t: string) => scopeTopics.has(t);
  const prodOn = (svc: string) =>
    selSet.has(svc) ||
    topo.edges.some((e) => e.kind === "produce" && e.source === svc && scopeTopics.has(e.target));
  const consOn = (svc: string) =>
    selSet.has(svc) ||
    topo.edges.some((e) => e.kind === "consume" && e.target === svc && scopeTopics.has(e.source));

  const path = (x1: number, y1: number, x2: number, y2: number) => {
    const dx = Math.max(60, (x2 - x1) * 0.5);
    return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
  };

  // Aggregate consumer-service stats for node labels.
  const consStat = new Map<string, { topics: Set<string>; rate: number; level: Level }>();
  for (const c of topo.consumers) {
    const cur = consStat.get(c.service) ?? { topics: new Set(), rate: 0, level: "ok" as Level };
    cur.rate += c.rate_per_sec;
    cur.level = worst(cur.level, levelFromError(c.error_rate));
    consStat.set(c.service, cur);
  }
  for (const e of topo.edges) {
    if (e.kind === "consume") consStat.get(e.target)?.topics.add(e.source);
  }

  return (
    <div className="overflow-x-auto">
      <style>{`@keyframes kflow { to { stroke-dashoffset: -16; } }
        .kedge { stroke-dasharray: 5 6; animation: kflow 1.1s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .kedge { animation: none; } }`}</style>
      <div className="relative mx-auto" style={{ width: W, height: H }}>
        {(["Producers", "Topics", "Consumers"] as const).map((label, i) => (
          <div
            key={label}
            className="absolute font-semibold text-[10.5px] text-[var(--fg-3)] uppercase tracking-[0.06em]"
            style={{ left: [PROD_X, TOPIC_X, CONS_X][i], top: 2 }}
          >
            {label}
          </div>
        ))}

        <svg
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          className="pointer-events-none absolute inset-0"
        >
          <title>Kafka producers to topics to consumers flow</title>
          {topo.edges
            .filter((e) =>
              e.kind === "produce"
                ? selSet.has(e.source) || scopeTopics.has(e.target)
                : selSet.has(e.target) || scopeTopics.has(e.source)
            )
            .map((e, i) => {
              if (e.kind === "produce") {
                const y1 = (prodY.get(e.source) ?? TOP) + NODE_H / 2;
                const y2 = (topicY.get(e.target) ?? TOP) + NODE_H / 2;
                return (
                  <path
                    key={`p${i}`}
                    d={path(PROD_X + PROD_W, y1, TOPIC_X, y2)}
                    fill="none"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    className="kedge"
                    style={{ opacity: 0.55 }}
                  />
                );
              }
              const lv = topicLevel.get(e.source) ?? "ok";
              const y1 = (topicY.get(e.source) ?? TOP) + NODE_H / 2;
              const y2 = (consY.get(e.target) ?? TOP) + NODE_H / 2;
              return (
                <path
                  key={`c${i}`}
                  d={path(TOPIC_X + TOPIC_W, y1, CONS_X, y2)}
                  fill="none"
                  stroke={LV_EDGE[lv]}
                  strokeWidth={lv === "err" ? 3 : lv === "warn" ? 2.4 : 1.8}
                  className="kedge"
                  style={{ opacity: lv === "ok" ? 0.45 : 0.85 }}
                />
              );
            })}
        </svg>

        {topo.producers.map((p) => (
          <NodeBox
            key={p.service}
            x={PROD_X}
            y={prodY.get(p.service) ?? TOP}
            w={PROD_W}
            dim={!prodOn(p.service)}
            accent={selSet.has(p.service) ? "var(--brand)" : "var(--line)"}
            onClick={() => onToggleService(p.service)}
          >
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] bg-[var(--brand-tint)] text-[var(--brand)]">
                <Server size={13} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-mono font-semibold text-[12.5px] text-[var(--fg-0)]">
                  {p.service}
                </div>
                <div className="text-[11px] text-[var(--fg-3)]">
                  produces · {fmtRate(p.rate_per_sec)}/s
                </div>
              </div>
            </div>
          </NodeBox>
        ))}

        {topics.map((t) => {
          const lv = topicLevel.get(t.topic) ?? "ok";
          const accent =
            lv === "err"
              ? "color-mix(in oklab, var(--err) 45%, var(--line))"
              : lv === "warn"
                ? "color-mix(in oklab, var(--warn) 45%, var(--line))"
                : "var(--line)";
          return (
            <NodeBox
              key={t.topic}
              x={TOPIC_X}
              y={topicY.get(t.topic) ?? TOP}
              w={TOPIC_W}
              dim={!onTopic(t.topic)}
              accent={accent}
              onClick={() => onOpenTopic(t)}
            >
              <div className="flex items-start justify-between">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] bg-[var(--accent-violet-soft)] text-[var(--accent-violet)]">
                    <Layers size={13} />
                  </span>
                  <div className="min-w-0">
                    <div className="max-w-[150px] truncate font-mono font-semibold text-[12.5px] text-[var(--fg-0)]">
                      {t.topic}
                    </div>
                    <div className="text-[11px] text-[var(--fg-3)]">
                      {t.producer_count}p · {t.consumer_group_count}g · {fmtRate(t.rate_per_sec)}/s
                    </div>
                  </div>
                </div>
                <span
                  className="mt-0.5 h-2 w-2 shrink-0 rounded-full"
                  style={{ background: LV_COLOR[lv] }}
                />
              </div>
            </NodeBox>
          );
        })}

        {consumerSvcs.map((svc) => {
          const st = consStat.get(svc);
          const status = st?.level ?? "ok";
          return (
            <NodeBox
              key={svc}
              x={CONS_X}
              y={consY.get(svc) ?? TOP}
              w={CONS_W}
              dim={!consOn(svc)}
              accent={
                selSet.has(svc)
                  ? "var(--brand)"
                  : status === "err"
                    ? "color-mix(in oklab, var(--err) 45%, var(--line))"
                    : "var(--line)"
              }
              onClick={() => onToggleService(svc)}
            >
              <div className="flex items-center gap-2">
                <span className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] bg-[var(--brand-tint)] text-[var(--brand)]">
                  <Server size={13} />
                  <span
                    className="absolute right-[-2px] bottom-[-2px] h-2 w-2 rounded-full border-[1.5px] border-[var(--bg-card)]"
                    style={{ background: LV_COLOR[status] }}
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-mono font-semibold text-[12.5px] text-[var(--fg-0)]">
                    {svc}
                  </div>
                  <div className="text-[11px] text-[var(--fg-3)]">
                    consumes {st?.topics.size ?? 0} · {fmtRate(st?.rate ?? 0)}/s
                  </div>
                </div>
              </div>
            </NodeBox>
          );
        })}
      </div>
    </div>
  );
}
