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
      ratePerSec: 120,
      errorRate: 0.5,
      p50Ms: 8,
      p95Ms: 18,
      p99Ms: 30,
    },
    {
      service: "billing",
      ratePerSec: 20,
      errorRate: 0,
      p50Ms: 5,
      p95Ms: 12,
      p99Ms: 20,
    },
  ],
  topics: [
    { topic: "orders", ratePerSec: 140, producerCount: 2, consumerGroupCount: 2 },
    { topic: "payments", ratePerSec: 40, producerCount: 1, consumerGroupCount: 1 },
  ],
  consumers: [
    {
      service: "checkout",
      group: "receipts",
      ratePerSec: 30,
      errorRate: 2,
      p50Ms: 10,
      p95Ms: 25,
      p99Ms: 40,
    },
    {
      service: "checkout",
      group: "audit",
      ratePerSec: 10,
      errorRate: 0,
      p50Ms: 7,
      p95Ms: 15,
      p99Ms: 24,
    },
    {
      service: "worker",
      group: "fulfilment",
      ratePerSec: 80,
      errorRate: 0,
      p50Ms: 9,
      p95Ms: 20,
      p99Ms: 32,
    },
  ],
  edges: [
    { source: "checkout", target: "orders", kind: "produce", ratePerSec: 100 },
    { source: "checkout", target: "payments", kind: "produce", ratePerSec: 20 },
    { source: "billing", target: "orders", kind: "produce", ratePerSec: 20 },
    { source: "orders", target: "checkout", kind: "consume", ratePerSec: 40 },
    { source: "orders", target: "worker", kind: "consume", ratePerSec: 80 },
  ],
  pathways: [
    {
      producer: "checkout",
      topic: "orders",
      group: "receipts",
      consumer: "checkout",
      produceRatePerSec: 120,
      consumeRatePerSec: 30,
      errorRate: 2,
    },
    {
      producer: "checkout",
      topic: "orders",
      group: "audit",
      consumer: "checkout",
      produceRatePerSec: 120,
      consumeRatePerSec: 10,
      errorRate: 0,
    },
    {
      producer: "checkout",
      topic: "orders",
      group: "fulfilment",
      consumer: "worker",
      produceRatePerSec: 120,
      consumeRatePerSec: 80,
      errorRate: 0,
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
