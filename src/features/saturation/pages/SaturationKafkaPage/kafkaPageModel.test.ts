import { describe, expect, it } from "vitest";

import type { KafkaTopology } from "@/features/saturation/api/kafkaTopologySchemas";

import {
  buildKafkaPageModel,
  formatMilliseconds,
  formatPercent,
  formatRate,
  resolveKafkaService,
} from "./kafkaPageModel";

const topology: KafkaTopology = {
  producers: [
    {
      service: "checkout",
      rate_per_sec: 120,
      error_rate: 0.5,
      p50_ms: 8,
      p95_ms: 18,
      p99_ms: 30,
    },
    {
      service: "billing",
      rate_per_sec: 20,
      error_rate: 0,
      p50_ms: 5,
      p95_ms: 12,
      p99_ms: 20,
    },
  ],
  topics: [
    { topic: "orders", rate_per_sec: 140, producer_count: 2, consumer_group_count: 2 },
    { topic: "payments", rate_per_sec: 40, producer_count: 1, consumer_group_count: 1 },
  ],
  consumers: [
    {
      service: "checkout",
      group: "receipts",
      rate_per_sec: 30,
      error_rate: 2,
      p50_ms: 10,
      p95_ms: 25,
      p99_ms: 40,
    },
    {
      service: "checkout",
      group: "audit",
      rate_per_sec: 10,
      error_rate: 0,
      p50_ms: 7,
      p95_ms: 15,
      p99_ms: 24,
    },
    {
      service: "worker",
      group: "fulfilment",
      rate_per_sec: 80,
      error_rate: 0,
      p50_ms: 9,
      p95_ms: 20,
      p99_ms: 32,
    },
  ],
  edges: [
    { source: "checkout", target: "orders", kind: "produce", rate_per_sec: 100 },
    { source: "checkout", target: "payments", kind: "produce", rate_per_sec: 20 },
    { source: "billing", target: "orders", kind: "produce", rate_per_sec: 20 },
    { source: "orders", target: "checkout", kind: "consume", rate_per_sec: 40 },
    { source: "orders", target: "worker", kind: "consume", rate_per_sec: 80 },
  ],
  pathways: [
    {
      producer: "checkout",
      topic: "orders",
      group: "receipts",
      consumer: "checkout",
      produce_rate_per_sec: 120,
      consume_rate_per_sec: 30,
      error_rate: 2,
    },
    {
      producer: "checkout",
      topic: "orders",
      group: "audit",
      consumer: "checkout",
      produce_rate_per_sec: 120,
      consume_rate_per_sec: 10,
      error_rate: 0,
    },
    {
      producer: "checkout",
      topic: "orders",
      group: "fulfilment",
      consumer: "worker",
      produce_rate_per_sec: 120,
      consume_rate_per_sec: 80,
      error_rate: 0,
    },
  ],
};

describe("buildKafkaPageModel", () => {
  it("returns production and consumption metrics for the selected service", () => {
    const model = buildKafkaPageModel(topology, "checkout");

    expect(model.productionRate).toBe(120);
    expect(model.productionErrorRate).toBe(0.5);
    expect(model.productionP50Ms).toBe(8);
    expect(model.productionP95Ms).toBe(18);
    expect(model.productionP99Ms).toBe(30);
    expect(model.consumptionRate).toBe(40);
    expect(model.production.map((row) => row.topic)).toEqual(["orders", "payments"]);
    expect(model.consumption.map((row) => row.group)).toEqual(["receipts", "audit"]);
    expect(model.consumption[0]).toMatchObject({ p50Ms: 10, p95Ms: 25, p99Ms: 40 });
    expect(model.topicCount).toBe(2);
    expect(model.consumerGroupCount).toBe(3);
  });

  it("returns zero service metrics when the selected service has no matching role", () => {
    const model = buildKafkaPageModel(topology, "unknown");

    expect(model.productionRate).toBe(0);
    expect(model.consumptionRate).toBe(0);
    expect(model.production).toEqual([]);
    expect(model.consumption).toEqual([]);
  });
});

describe("resolveKafkaService", () => {
  it("selects the first service when no valid service is selected", () => {
    expect(resolveKafkaService(["first", "second"], null)).toBe("first");
    expect(resolveKafkaService(["first", "second"], "missing")).toBe("first");
  });

  it("keeps an explicitly selected service while it remains available", () => {
    expect(resolveKafkaService(["first", "second"], "second")).toBe("second");
  });
});

describe("Kafka metric formatting", () => {
  it("formats rates, percentages, and durations consistently", () => {
    expect(formatRate(1_250)).toBe("1.3k");
    expect(formatPercent(2.25)).toBe("2.3%");
    expect(formatMilliseconds(1_250)).toBe("1.3s");
  });
});
