import { Check, Layers, Server } from "lucide-react";
import { useState } from "react";

import {
  DrawerHeader,
  DrawerKpi,
  DrawerSection,
  DrawerShell,
  DrawerTabs,
} from "@shared/components/ui/overlay/detail-drawer";

import type { KafkaTopology, TopicNode } from "@/features/saturation/api/kafkaTopologySchemas";

import type { GroupSelection } from "./KafkaTopicDrawer";
import { LEVEL_LABEL, type Level, fmtPct, fmtRate, levelFromError } from "./model";

const LV_COLOR: Record<Level, string> = { ok: "var(--ok)", warn: "var(--warn)", err: "var(--err)" };

interface Props {
  readonly group: GroupSelection | null;
  readonly topo: KafkaTopology;
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onOpenTopic: (t: TopicNode) => void;
}

/** Consumer-group drawer (design `KafkaGroupDrawer`), framed on the service. */
export function KafkaGroupDrawer({ group, topo, open, onClose, onOpenTopic }: Props) {
  const [tab, setTab] = useState("overview");
  if (!group) return null;

  const subscribed = topo.pathways
    .filter((p) => p.group === group.group && p.consumer === group.consumer)
    .map((p) => ({
      topic: p.topic,
      producer: p.producer,
      rate: p.consume_rate_per_sec,
      error: p.error_rate,
    }));
  const totalRate = subscribed.reduce((a, s) => a + s.rate, 0);
  const worstErr = subscribed.reduce((a, s) => Math.max(a, s.error), 0);
  const lv = levelFromError(worstErr);
  const stalled = lv === "err";
  const state = stalled ? "Critical" : lv === "warn" ? "Degraded" : "Stable";

  const openTopic = (name: string) => {
    const full = topo.topics.find((t) => t.topic === name);
    if (full) onOpenTopic(full);
  };

  return (
    <DrawerShell open={open} onClose={onClose} width={600}>
      <DrawerHeader onClose={onClose}>
        <div className="flex items-start gap-3">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-[9px] bg-[var(--brand-tint)] text-[var(--brand)]">
            <Server size={20} />
            <span
              className="absolute right-[-2px] bottom-[-2px] h-[11px] w-[11px] rounded-full border-2 border-[var(--bg-canvas)]"
              style={{ background: LV_COLOR[lv] }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold font-mono text-[16px] text-[var(--fg-0)]">
                {group.consumer}
              </span>
              <span className={`badge ${lv}`}>
                <span className="b-dot" />
                {state}
              </span>
            </div>
            <div className="mt-1.5 font-mono text-[12px] text-[var(--fg-3)]">
              group {group.group} · {subscribed.length} topics
            </div>
          </div>
        </div>
      </DrawerHeader>

      <DrawerTabs
        tabs={[
          { id: "overview", label: "Overview" },
          { id: "topics", label: "Topics", badge: subscribed.length },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div className="flex-1 overflow-y-auto px-[18px] py-4">
        {tab === "overview" && (
          <>
            <div className="mb-5 grid grid-cols-3 gap-2.5">
              <DrawerKpi
                label="Consume rate"
                value={fmtRate(totalRate)}
                unit="/s"
                deltaTone={stalled ? "warn" : "up"}
                delta={stalled ? "stalled" : undefined}
              />
              <DrawerKpi
                label="Max err"
                value={fmtPct(worstErr)}
                deltaTone={stalled ? "down" : "up"}
              />
              <DrawerKpi label="Topics" value={String(subscribed.length)} />
            </div>

            <DrawerSection
              title="Reads from"
              action={
                <span className="text-[11.5px] text-[var(--fg-3)]">
                  upstream topics &amp; producers
                </span>
              }
            >
              <div className="flex flex-col gap-2">
                {subscribed.map((s, i) => (
                  <div
                    key={i}
                    onClick={() => openTopic(s.topic)}
                    className="cursor-pointer rounded-lg border bg-[var(--bg-inset)] px-3 py-2.5"
                    style={{
                      borderColor:
                        levelFromError(s.error) === "err"
                          ? "color-mix(in oklab, var(--err) 25%, transparent)"
                          : "var(--line-2)",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <Layers size={13} style={{ color: "var(--accent-violet)" }} />
                        <span className="truncate font-mono text-[13px] text-[var(--fg-0)]">
                          {s.topic}
                        </span>
                      </div>
                      <span
                        className="shrink-0 font-mono font-semibold text-[13px]"
                        style={{ color: LV_COLOR[levelFromError(s.error)] }}
                      >
                        {fmtPct(s.error)}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="font-mono text-[11.5px] text-[var(--fg-3)]">from</span>
                      <Server size={10} style={{ color: "var(--brand)" }} />
                      <span className="font-mono text-[11.5px] text-[var(--brand-deep)]">
                        {s.producer}
                      </span>
                      <span className="font-mono text-[11.5px] text-[var(--fg-3)]">
                        · {fmtRate(s.rate)}/s
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </DrawerSection>

            <DrawerSection title="Health">
              <div
                className="flex items-center gap-2.5 rounded-lg px-3.5 py-3"
                style={{
                  background: stalled ? "var(--err-soft)" : "var(--ok-soft)",
                  border: `1px solid color-mix(in oklab, var(--${stalled ? "err" : "ok"}) 30%, var(--line))`,
                }}
              >
                <Check size={15} style={{ color: stalled ? "var(--err)" : "var(--ok)" }} />
                <span className="font-medium text-[13px] text-[var(--fg-0)]">
                  {stalled
                    ? `${group.consumer} error budget exceeded on ${group.group}`
                    : `${group.consumer} keeping up with production · within error budget`}
                </span>
              </div>
            </DrawerSection>
          </>
        )}

        {tab === "topics" && (
          <DrawerSection
            title="Subscribed topics"
            action={
              <span className="text-[11.5px] text-[var(--fg-3)]">{subscribed.length} topics</span>
            }
          >
            <div className="flex flex-col gap-2">
              {subscribed.map((s, i) => (
                <div
                  key={i}
                  onClick={() => openTopic(s.topic)}
                  className="grid cursor-pointer grid-cols-[1fr_auto] items-center gap-2.5 rounded-lg border border-[var(--line-2)] bg-[var(--bg-inset)] px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <div className="truncate font-mono text-[13px] text-[var(--fg-0)]">
                      {s.topic}
                    </div>
                    <div className="mt-0.5 font-mono text-[12px] text-[var(--fg-3)]">
                      from {s.producer}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className="font-mono font-semibold text-[13px]"
                      style={{ color: LV_COLOR[levelFromError(s.error)] }}
                    >
                      {fmtRate(s.rate)}/s
                    </div>
                    <div className="font-mono text-[11px] text-[var(--fg-3)]">
                      {LEVEL_LABEL[levelFromError(s.error)]}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </DrawerSection>
        )}
      </div>
    </DrawerShell>
  );
}
