import type { KafkaTopology } from "@/features/saturation/api/kafkaTopologySchemas";

export type Health = "healthy" | "warning" | "critical";

export interface ProductionRow {
  topic: string;
  rate: number;
  producerCount: number;
  consumerGroupCount: number;
}

export interface ConsumptionRow {
  group: string;
  topics: string[];
  rate: number;
  errorRate: number;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
}

export interface ConsumerGroupRow {
  group: string;
  consumer: string;
  topic: string;
  rate: number;
  errorRate: number;
}

export interface KafkaPageModel {
  productionRate: number;
  productionErrorRate: number;
  productionP50Ms: number;
  productionP95Ms: number;
  productionP99Ms: number;
  consumptionRate: number;
  topicCount: number;
  consumerGroupCount: number;
  production: ProductionRow[];
  consumption: ConsumptionRow[];
  consumerGroups: ConsumerGroupRow[];
}

export function resolveKafkaService(
  services: readonly string[],
  requestedService: string | null
): string | null {
  if (requestedService && services.includes(requestedService)) return requestedService;
  return services[0] ?? null;
}

export function healthFromError(errorRate: number): Health {
  if (errorRate >= 5) return "critical";
  if (errorRate >= 1) return "warning";
  return "healthy";
}

export function formatRate(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(value >= 10_000 ? 0 : 1)}k`;
  return Math.round(value).toLocaleString();
}

export function formatPercent(value: number): string {
  return `${value.toFixed(value >= 10 ? 0 : 1)}%`;
}

export function formatMilliseconds(value: number): string {
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}s`;
  return `${Math.round(value)}ms`;
}

export function buildKafkaPageModel(topo: KafkaTopology, service: string): KafkaPageModel {
  const topicsByName = new Map(topo.topics.map((topic) => [topic.topic, topic]));
  const producer = topo.producers.find((item) => item.service === service);

  const production = topo.edges
    .filter((edge) => edge.kind === "produce" && edge.source === service)
    .map((edge) => {
      const topic = topicsByName.get(edge.target);
      return {
        topic: edge.target,
        rate: edge.ratePerSec,
        producerCount: topic?.producerCount ?? 0,
        consumerGroupCount: topic?.consumerGroupCount ?? 0,
      };
    })
    .sort((a, b) => b.rate - a.rate || a.topic.localeCompare(b.topic));

  const consumption = topo.consumers
    .filter((consumer) => consumer.service === service)
    .map((consumer) => ({
      group: consumer.group,
      topics: Array.from(
        new Set(
          topo.pathways
            .filter((pathway) => pathway.consumer === service && pathway.group === consumer.group)
            .map((pathway) => pathway.topic)
        )
      ).sort(),
      rate: consumer.ratePerSec,
      errorRate: consumer.errorRate,
      p50Ms: consumer.p50Ms,
      p95Ms: consumer.p95Ms,
      p99Ms: consumer.p99Ms,
    }))
    .sort((a, b) => b.rate - a.rate || a.group.localeCompare(b.group));

  const consumerGroups = topo.pathways
    .map((pathway) => ({
      group: pathway.group,
      consumer: pathway.consumer,
      topic: pathway.topic,
      rate: pathway.consumeRatePerSec,
      errorRate: pathway.errorRate,
    }))
    .sort((a, b) => b.rate - a.rate || a.group.localeCompare(b.group));

  return {
    productionRate: producer?.ratePerSec ?? 0,
    productionErrorRate: producer?.errorRate ?? 0,
    productionP50Ms: producer?.p50Ms ?? 0,
    productionP95Ms: producer?.p95Ms ?? 0,
    productionP99Ms: producer?.p99Ms ?? 0,
    consumptionRate: consumption.reduce((total, row) => total + row.rate, 0),
    topicCount: topo.topics.length,
    consumerGroupCount: new Set(topo.pathways.map((pathway) => pathway.group)).size,
    production,
    consumption,
    consumerGroups,
  };
}
