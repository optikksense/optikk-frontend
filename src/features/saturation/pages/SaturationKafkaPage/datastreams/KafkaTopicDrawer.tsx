import { Layers, Server } from "lucide-react";

import {
  DrawerHeader,
  DrawerKpi,
  DrawerSection,
  DrawerShell,
  DrawerTabs,
} from "@shared/components/ui/overlay/detail-drawer";

import type { KafkaTopology, TopicNode } from "@/features/saturation/api/kafkaTopologySchemas";

import { useState } from "react";
import { LEVEL_LABEL, type Level, fmtPct, fmtRate, levelFromError } from "./model";

const LV_COLOR: Record<Level, string> = { ok: "var(--ok)", warn: "var(--warn)", err: "var(--err)" };

export interface GroupSelection {
  group: string;
  consumer: string;
  topic: string;
  level: Level;
}

interface Props {
  readonly topic: TopicNode | null;
  readonly topo: KafkaTopology;
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onOpenGroup: (g: GroupSelection) => void;
}

function SvcChip({
  id,
  sub,
  value,
  valueColor,
  level,
  onClick,
}: {
  id: string;
  sub?: string;
  value?: string;
  valueColor?: string;
  level?: Level;
  onClick?: () => void;
}) {
  const Component = onClick ? "button" : "div";
  return (
    <Component
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`flex items-center justify-between rounded-lg border bg-[var(--bg-inset)] px-3 py-2.5 ${onClick ? "block w-full cursor-pointer text-left" : ""}`}
      style={{
        borderColor:
          level === "err" ? "color-mix(in oklab, var(--err) 25%, transparent)" : "var(--line-2)",
      }}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="relative flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[6px] bg-[var(--brand-tint)] text-[var(--brand)]">
          <Server size={13} />
          {level && (
            <span
              className="absolute right-[-2px] bottom-[-2px] h-2 w-2 rounded-full border-[1.5px] border-[var(--bg-inset)]"
              style={{ background: LV_COLOR[level] }}
            />
          )}
        </span>
        <div className="min-w-0">
          <div className="truncate font-mono font-semibold text-[13px] text-[var(--fg-0)]">
            {id}
          </div>
          {sub && <div className="mt-0.5 font-mono text-[11.5px] text-[var(--fg-3)]">{sub}</div>}
        </div>
      </div>
      {value != null && (
        <div className="shrink-0 text-right">
          <div className="font-mono font-semibold text-[13px]" style={{ color: valueColor }}>
            {value}
          </div>
          <div className="font-mono text-[11px] text-[var(--fg-3)]">err</div>
        </div>
      )}
    </Component>
  );
}

/** Topic detail drawer (design `KafkaTopicDrawer`), client-centric. */
export function KafkaTopicDrawer({ topic, topo, open, onClose, onOpenGroup }: Props) {
  const [tab, setTab] = useState("overview");
  if (!topic) return null;

  const producers = topo.edges
    .filter((e) => e.kind === "produce" && e.target === topic.topic)
    .map((e) => ({ svc: e.source, rate: e.rate_per_sec }));
  const consumers = topo.pathways
    .filter((p) => p.topic === topic.topic)
    .map((p) => ({
      svc: p.consumer,
      group: p.group,
      rate: p.consume_rate_per_sec,
      error: p.error_rate,
    }));
  const worstErr = consumers.reduce((a, c) => Math.max(a, c.error), 0);
  const lv = levelFromError(worstErr);

  return (
    <DrawerShell open={open} onClose={onClose} width={600}>
      <DrawerHeader onClose={onClose}>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[9px] bg-[var(--accent-violet-soft)] text-[var(--accent-violet)]">
            <Layers size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate font-bold font-mono text-[16px] text-[var(--fg-0)]">
                {topic.topic}
              </span>
              <span className={`badge ${lv}`}>
                <span className="b-dot" />
                {LEVEL_LABEL[lv]}
              </span>
            </div>
            <div className="mt-1.5 font-mono text-[12px] text-[var(--fg-3)]">
              {topic.producer_count} producer · {topic.consumer_group_count} groups ·{" "}
              {fmtRate(topic.rate_per_sec)}/s
            </div>
          </div>
        </div>
      </DrawerHeader>

      <DrawerTabs
        tabs={[
          { id: "overview", label: "Overview" },
          { id: "consumers", label: "Consumers", badge: consumers.length },
          { id: "producers", label: "Producers", badge: producers.length },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div className="flex-1 overflow-y-auto px-[18px] py-4">
        {tab === "overview" && (
          <>
            <div className="mb-5 grid grid-cols-3 gap-2.5">
              <DrawerKpi label="Msg/s in" value={fmtRate(topic.rate_per_sec)} />
              <DrawerKpi label="Consumers" value={String(consumers.length)} unit="clients" />
              <DrawerKpi
                label="Max err"
                value={fmtPct(worstErr)}
                deltaTone={worstErr >= 0.05 ? "down" : "up"}
              />
            </div>
            <DrawerSection
              title="Producers"
              action={
                <span className="text-[11.5px] text-[var(--fg-3)]">writing to this topic</span>
              }
            >
              <div className="flex flex-col gap-2">
                {producers.map((p) => (
                  <SvcChip key={p.svc} id={p.svc} sub={`producing · ${fmtRate(p.rate)}/s`} />
                ))}
              </div>
            </DrawerSection>
            <DrawerSection
              title="Consuming services"
              action={<span className="text-[11.5px] text-[var(--fg-3)]">reading this topic</span>}
            >
              <div className="flex flex-col gap-2">
                {consumers.map((c, i) => (
                  <SvcChip
                    key={i}
                    id={c.svc}
                    sub={c.group}
                    level={levelFromError(c.error)}
                    value={fmtPct(c.error)}
                    valueColor={LV_COLOR[levelFromError(c.error)]}
                    onClick={() =>
                      onOpenGroup({
                        group: c.group,
                        consumer: c.svc,
                        topic: topic.topic,
                        level: levelFromError(c.error),
                      })
                    }
                  />
                ))}
              </div>
            </DrawerSection>
          </>
        )}

        {tab === "consumers" && (
          <DrawerSection
            title="Consuming services"
            action={
              <span className="text-[11.5px] text-[var(--fg-3)]">{consumers.length} clients</span>
            }
          >
            <div className="flex flex-col gap-2">
              {consumers.map((c, i) => (
                <SvcChip
                  key={i}
                  id={c.svc}
                  sub={`group · ${c.group}`}
                  level={levelFromError(c.error)}
                  value={fmtPct(c.error)}
                  valueColor={LV_COLOR[levelFromError(c.error)]}
                  onClick={() =>
                    onOpenGroup({
                      group: c.group,
                      consumer: c.svc,
                      topic: topic.topic,
                      level: levelFromError(c.error),
                    })
                  }
                />
              ))}
            </div>
          </DrawerSection>
        )}

        {tab === "producers" && (
          <DrawerSection
            title="Producing services"
            action={
              <span className="text-[11.5px] text-[var(--fg-3)]">{producers.length} clients</span>
            }
          >
            <div className="flex flex-col gap-2">
              {producers.map((p) => (
                <SvcChip key={p.svc} id={p.svc} sub={`writing · ${fmtRate(p.rate)}/s`} />
              ))}
            </div>
          </DrawerSection>
        )}
      </div>
    </DrawerShell>
  );
}
