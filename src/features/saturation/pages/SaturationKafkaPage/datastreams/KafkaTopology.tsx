import {
  Background,
  Controls,
  type Edge,
  type EdgeTypes,
  type Node,
  type NodeTypes,
  ReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useMemo } from "react";

import type {
  TopicNode,
  KafkaTopology as Topo,
} from "@/features/saturation/api/kafkaTopologySchemas";

import { type Level, levelFromError, worst } from "./model";
import { ConsumerNode } from "./nodes/ConsumerNode";
import { KafkaTopicNode } from "./nodes/KafkaTopicNode";
import { ProducerNode } from "./nodes/ProducerNode";
import { LV_COLOR } from "./nodes/types";
import type { ConsumerNodeData, ProducerNodeData, TopicNodeData } from "./nodes/types";

const kafkaNodeTypes: NodeTypes = {
  producer: ProducerNode,
  topic: KafkaTopicNode,
  consumer: ConsumerNode,
};

const kafkaEdgeTypes: EdgeTypes = {};

// ─── Layout Constants ────────────────────────────────────────────
const PROD_X = 0;
const TOPIC_X = 400;
const CONS_X = 850;
const GAP_Y = 90;

// ─── Graph Builder ───────────────────────────────────────────────
function buildKafkaGraph(
  topo: Topo,
  selected: readonly string[]
): { nodes: Node[]; edges: Edge[] } {
  const selSet = new Set(selected);

  // Compute topic health levels
  const topicLevel = new Map<string, Level>();
  for (const pw of topo.pathways) {
    topicLevel.set(
      pw.topic,
      worst(topicLevel.get(pw.topic) ?? "ok", levelFromError(pw.error_rate))
    );
  }

  // Compute consumer stats
  const consStat = new Map<string, { topics: Set<string>; rate: number; level: Level }>();
  for (const c of topo.consumers) {
    const cur = consStat.get(c.service) ?? {
      topics: new Set<string>(),
      rate: 0,
      level: "ok" as Level,
    };
    cur.rate += c.rate_per_sec;
    cur.level = worst(cur.level, levelFromError(c.error_rate));
    consStat.set(c.service, cur);
  }
  for (const e of topo.edges) {
    if (e.kind === "consume") consStat.get(e.target)?.topics.add(e.source);
  }

  const producers = topo.producers.map((p) => p.service);
  const topics = topo.topics;
  const consumerSvcs = Array.from(new Set(topo.consumers.map((c) => c.service)));

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Producer nodes
  producers.forEach((svc, i) => {
    const prod = topo.producers.find((p) => p.service === svc);
    nodes.push({
      id: `prod-${svc}`,
      type: "producer",
      position: { x: PROD_X, y: i * GAP_Y },
      data: {
        label: svc,
        rate: prod?.rate_per_sec ?? 0,
        isSelected: selSet.has(svc),
      } satisfies ProducerNodeData,
    });
  });

  // Topic nodes
  topics.forEach((t, i) => {
    nodes.push({
      id: `topic-${t.topic}`,
      type: "topic",
      position: { x: TOPIC_X, y: i * GAP_Y },
      data: {
        label: t.topic,
        rate: t.rate_per_sec,
        producerCount: t.producer_count,
        consumerGroupCount: t.consumer_group_count,
        level: topicLevel.get(t.topic) ?? "ok",
        topicNode: t,
      } satisfies TopicNodeData,
    });
  });

  // Consumer nodes
  consumerSvcs.forEach((svc, i) => {
    const st = consStat.get(svc);
    nodes.push({
      id: `cons-${svc}`,
      type: "consumer",
      position: { x: CONS_X, y: i * GAP_Y },
      data: {
        label: svc,
        rate: st?.rate ?? 0,
        topicCount: st?.topics.size ?? 0,
        level: st?.level ?? "ok",
        isSelected: selSet.has(svc),
      } satisfies ConsumerNodeData,
    });
  });

  // Edges
  topo.edges.forEach((e, i) => {
    if (e.kind === "produce") {
      edges.push({
        id: `e-produce-${i}`,
        source: `prod-${e.source}`,
        target: `topic-${e.target}`,
        animated: true,
        style: { stroke: "var(--chart-1)", strokeWidth: 2, opacity: 0.55 },
      });
    } else {
      const lv = topicLevel.get(e.source) ?? "ok";
      edges.push({
        id: `e-consume-${i}`,
        source: `topic-${e.source}`,
        target: `cons-${e.target}`,
        animated: true,
        style: {
          stroke: LV_COLOR[lv],
          strokeWidth: lv === "err" ? 3 : lv === "warn" ? 2.4 : 1.8,
          opacity: lv === "ok" ? 0.45 : 0.85,
        },
      });
    }
  });

  return { nodes, edges };
}

// ─── Component ───────────────────────────────────────────────────
interface Props {
  readonly topo: Topo;
  readonly selected: readonly string[];
  readonly onToggleService: (id: string) => void;
  readonly onOpenTopic: (topic: TopicNode) => void;
}

function KafkaTopologyInner({ topo, selected, onToggleService, onOpenTopic }: Props) {
  const { nodes, edges } = useMemo(() => buildKafkaGraph(topo, selected), [topo, selected]);

  return (
    <div
      style={{
        height: Math.max(
          400,
          Math.max(topo.producers.length, topo.topics.length, topo.consumers?.length ?? 0) * GAP_Y +
            60
        ),
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={kafkaNodeTypes}
        edgeTypes={kafkaEdgeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable
        minZoom={0.3}
        maxZoom={1.5}
        onNodeClick={(_, node) => {
          if (node.type === "producer" || node.type === "consumer") {
            const svc = node.id.replace(/^(prod|cons)-/, "");
            onToggleService(svc);
          } else if (node.type === "topic") {
            const d = node.data as TopicNodeData;
            onOpenTopic(d.topicNode);
          }
        }}
      >
        <Background color="var(--border-color)" gap={24} />
        <Controls showInteractive={false} position="bottom-left" />
      </ReactFlow>
    </div>
  );
}

/** Producers ▸ topics ▸ consumers topology powered by React Flow. */
export function KafkaTopology(props: Props) {
  return (
    <ReactFlowProvider>
      <KafkaTopologyInner {...props} />
    </ReactFlowProvider>
  );
}
