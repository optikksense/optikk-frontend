import {
  Background,
  Controls,
  type Edge,
  Handle,
  type Node,
  type NodeProps,
  type NodeTypes,
  Position,
  ReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Layers, Server } from "lucide-react";
import { useMemo } from "react";

import type { KafkaTopology } from "@/features/saturation/api/kafkaTopologySchemas";

import { type Health, formatRate, healthFromError } from "../kafkaPageModel";

type NodeRole = "producer" | "topic" | "consumer";

interface KafkaGraphNodeData extends Record<string, unknown> {
  role: NodeRole;
  entityId: string;
  label: string;
  detail: string;
  health: Health;
}

const HEALTH_COLOR: Record<Health, string> = {
  healthy: "var(--ok)",
  warning: "var(--warn)",
  critical: "var(--err)",
};

function KafkaGraphNode({ data }: NodeProps) {
  const node = data as KafkaGraphNodeData;
  const isProducer = node.role === "producer";
  const isConsumer = node.role === "consumer";

  return (
    <div
      className="flex min-h-14 w-[200px] items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2.5 shadow-[var(--shadow-sm)]"
      style={{
        borderColor:
          node.health === "healthy"
            ? "var(--line)"
            : `color-mix(in oklab, ${HEALTH_COLOR[node.health]} 45%, var(--line))`,
      }}
    >
      {!isProducer ? (
        <Handle type="target" position={Position.Left} className="!bg-border" />
      ) : null}
      <span
        className={`grid h-7 w-7 shrink-0 place-items-center rounded-md ${
          node.role === "topic"
            ? "bg-[var(--accent-violet-soft)] text-[var(--accent-violet)]"
            : "bg-[var(--brand-tint)] text-[var(--brand)]"
        }`}
      >
        {node.role === "topic" ? <Layers size={14} /> : <Server size={14} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-mono font-semibold text-[12px] text-foreground">
          {node.label}
        </span>
        <span className="block truncate text-[11px] text-foreground-muted">{node.detail}</span>
      </span>
      {node.role !== "producer" ? (
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ background: HEALTH_COLOR[node.health] }}
        />
      ) : null}
      {!isConsumer ? (
        <Handle type="source" position={Position.Right} className="!bg-border" />
      ) : null}
    </div>
  );
}

const NODE_TYPES: NodeTypes = { kafka: KafkaGraphNode };
const COLUMN_X = { producer: 0, topic: 390, consumer: 800 } as const;
const ROW_GAP = 88;

function graphElements(topo: KafkaTopology): { nodes: Node[]; edges: Edge[] } {
  const topicHealth = new Map<string, Health>();
  for (const pathway of topo.pathways) {
    const next = healthFromError(pathway.error_rate);
    const current = topicHealth.get(pathway.topic) ?? "healthy";
    if (next === "critical" || (next === "warning" && current === "healthy")) {
      topicHealth.set(pathway.topic, next);
    }
  }

  const consumers = new Map<string, { rate: number; topics: Set<string>; health: Health }>();
  for (const consumer of topo.consumers) {
    const current = consumers.get(consumer.service) ?? {
      rate: 0,
      topics: new Set<string>(),
      health: "healthy" as Health,
    };
    current.rate += consumer.rate_per_sec;
    const next = healthFromError(consumer.error_rate);
    if (next === "critical" || (next === "warning" && current.health === "healthy")) {
      current.health = next;
    }
    consumers.set(consumer.service, current);
  }
  for (const edge of topo.edges) {
    if (edge.kind === "consume") consumers.get(edge.target)?.topics.add(edge.source);
  }

  const nodes: Node[] = [
    ...topo.producers.map((producer, index) => ({
      id: `producer-${index}`,
      type: "kafka",
      position: { x: COLUMN_X.producer, y: index * ROW_GAP },
      data: {
        role: "producer",
        entityId: producer.service,
        label: producer.service,
        detail: `produces · ${formatRate(producer.rate_per_sec)}/s`,
        health: healthFromError(producer.error_rate),
      } satisfies KafkaGraphNodeData,
    })),
    ...topo.topics.map((topic, index) => ({
      id: `topic-${index}`,
      type: "kafka",
      position: { x: COLUMN_X.topic, y: index * ROW_GAP },
      data: {
        role: "topic",
        entityId: topic.topic,
        label: topic.topic,
        detail: `${topic.producer_count} producers · ${topic.consumer_group_count} groups`,
        health: topicHealth.get(topic.topic) ?? "healthy",
      } satisfies KafkaGraphNodeData,
    })),
    ...Array.from(consumers.entries()).map(([service, consumer], index) => ({
      id: `consumer-${index}`,
      type: "kafka",
      position: { x: COLUMN_X.consumer, y: index * ROW_GAP },
      data: {
        role: "consumer",
        entityId: service,
        label: service,
        detail: `${consumer.topics.size} topics · ${formatRate(consumer.rate)}/s`,
        health: consumer.health,
      } satisfies KafkaGraphNodeData,
    })),
  ];

  const producerNode = new Map(
    topo.producers.map((producer, index) => [producer.service, `producer-${index}`])
  );
  const topicNode = new Map(topo.topics.map((topic, index) => [topic.topic, `topic-${index}`]));
  const consumerNode = new Map(
    Array.from(consumers.keys()).map((service, index) => [service, `consumer-${index}`])
  );

  const edges = topo.edges.flatMap((edge, index): Edge[] => {
    const source =
      edge.kind === "produce" ? producerNode.get(edge.source) : topicNode.get(edge.source);
    const target =
      edge.kind === "produce" ? topicNode.get(edge.target) : consumerNode.get(edge.target);
    if (!source || !target) return [];
    return [
      {
        id: `edge-${index}`,
        source,
        target,
        animated: true,
        style: { stroke: "var(--chart-1)", strokeWidth: 2, opacity: 0.55 },
      },
    ];
  });

  return { nodes, edges };
}

interface KafkaTopologyGraphProps {
  readonly topology: KafkaTopology;
  readonly onSelectService: (service: string) => void;
}

function KafkaTopologyGraphInner({ topology, onSelectService }: KafkaTopologyGraphProps) {
  const { nodes, edges } = useMemo(() => graphElements(topology), [topology]);

  if (nodes.length === 0) {
    return (
      <div className="grid h-[280px] place-items-center text-[12px] text-foreground-muted">
        No topology data for this service in the selected time range.
      </div>
    );
  }

  const rowCount = Math.max(
    topology.producers.length,
    topology.topics.length,
    new Set(topology.consumers.map((consumer) => consumer.service)).size
  );

  return (
    <div style={{ height: Math.max(360, rowCount * ROW_GAP + 60) }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        fitView
        fitViewOptions={{ padding: 0.16 }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        minZoom={0.35}
        maxZoom={1.4}
        onNodeClick={(_, node) => {
          const data = node.data as KafkaGraphNodeData;
          if (data.role !== "topic") onSelectService(data.entityId);
        }}
      >
        <Background color="var(--border-color)" gap={24} />
        <Controls showInteractive={false} position="bottom-left" />
      </ReactFlow>
    </div>
  );
}

export function KafkaTopologyGraph(props: KafkaTopologyGraphProps) {
  return (
    <ReactFlowProvider>
      <KafkaTopologyGraphInner {...props} />
    </ReactFlowProvider>
  );
}
