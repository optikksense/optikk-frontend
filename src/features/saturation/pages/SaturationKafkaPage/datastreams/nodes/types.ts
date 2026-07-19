import type { TopicNode } from "@/features/saturation/api/kafkaTopologySchemas";
import type { Level } from "../model";

export interface ProducerNodeData {
  label: string;
  rate: number;
  [key: string]: unknown;
}

export interface TopicNodeData {
  label: string;
  rate: number;
  producerCount: number;
  consumerGroupCount: number;
  level: Level;
  topicNode: TopicNode;
  [key: string]: unknown;
}

export interface ConsumerNodeData {
  label: string;
  rate: number;
  topicCount: number;
  level: Level;
  [key: string]: unknown;
}

export const LV_COLOR: Record<Level, string> = {
  ok: "var(--ok)",
  warn: "var(--warn)",
  err: "var(--err)",
};
