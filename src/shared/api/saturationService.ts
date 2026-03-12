/**
 * Saturation Service — API calls for Kafka and database saturation monitoring.
 */
import { API_CONFIG } from '@config/apiConfig';

import api from './api';

import type { RequestTime } from './service-types';

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

export const saturationService = {
  // ── Kafka: summary ────────────────────────────────────────────────────────
  async getKafkaSummaryStats(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
  ): Promise<unknown> {
    return api.get(`${BASE}/saturation/kafka/summary-stats`, { params: { startTime, endTime } });
  },

  // ── Kafka: production rate (Dashboard 1) ──────────────────────────────────
  async getProduceRateByTopic(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
  ): Promise<unknown> {
    return api.get(`${BASE}/saturation/kafka/produce-rate-by-topic`, { params: { startTime, endTime } });
  },

  async getPublishLatencyByTopic(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
  ): Promise<unknown> {
    return api.get(`${BASE}/saturation/kafka/publish-latency-by-topic`, { params: { startTime, endTime } });
  },

  // ── Kafka: consumption rate by topic (Dashboard 2) ────────────────────────
  async getConsumeRateByTopic(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
  ): Promise<unknown> {
    return api.get(`${BASE}/saturation/kafka/consume-rate-by-topic`, { params: { startTime, endTime } });
  },

  async getReceiveLatencyByTopic(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
  ): Promise<unknown> {
    return api.get(`${BASE}/saturation/kafka/receive-latency-by-topic`, { params: { startTime, endTime } });
  },

  // ── Kafka: consumption rate by consumer group (Dashboard 3) ──────────────
  async getConsumeRateByGroup(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
  ): Promise<unknown> {
    return api.get(`${BASE}/saturation/kafka/consume-rate-by-group`, { params: { startTime, endTime } });
  },

  async getProcessRateByGroup(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
  ): Promise<unknown> {
    return api.get(`${BASE}/saturation/kafka/process-rate-by-group`, { params: { startTime, endTime } });
  },

  async getProcessLatencyByGroup(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
  ): Promise<unknown> {
    return api.get(`${BASE}/saturation/kafka/process-latency-by-group`, { params: { startTime, endTime } });
  },

  // ── Kafka: consumer lag (Dashboard 4) ─────────────────────────────────────
  async getConsumerLagByGroup(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
  ): Promise<unknown> {
    return api.get(`${BASE}/saturation/kafka/lag-by-group`, { params: { startTime, endTime } });
  },

  async getConsumerLagPerPartition(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
  ): Promise<unknown> {
    return api.get(`${BASE}/saturation/kafka/lag-per-partition`, { params: { startTime, endTime } });
  },

  // ── Kafka: rebalancing (Dashboard 5) ──────────────────────────────────────
  async getRebalanceSignals(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
  ): Promise<unknown> {
    return api.get(`${BASE}/saturation/kafka/rebalance-signals`, { params: { startTime, endTime } });
  },

  // ── Kafka: end-to-end latency (Dashboard 6) ───────────────────────────────
  async getE2ELatency(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
  ): Promise<unknown> {
    return api.get(`${BASE}/saturation/kafka/e2e-latency`, { params: { startTime, endTime } });
  },

  // ── Kafka: error rates (Dashboard 7) ──────────────────────────────────────
  async getPublishErrors(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
  ): Promise<unknown> {
    return api.get(`${BASE}/saturation/kafka/publish-errors`, { params: { startTime, endTime } });
  },

  async getConsumeErrors(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
  ): Promise<unknown> {
    return api.get(`${BASE}/saturation/kafka/consume-errors`, { params: { startTime, endTime } });
  },

  async getProcessErrors(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
  ): Promise<unknown> {
    return api.get(`${BASE}/saturation/kafka/process-errors`, { params: { startTime, endTime } });
  },

  async getClientOpErrors(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
  ): Promise<unknown> {
    return api.get(`${BASE}/saturation/kafka/client-op-errors`, { params: { startTime, endTime } });
  },

  // ── Kafka: broker connectivity (Dashboard 8) ──────────────────────────────
  async getBrokerConnections(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
  ): Promise<unknown> {
    return api.get(`${BASE}/saturation/kafka/broker-connections`, { params: { startTime, endTime } });
  },

  async getClientOperationDuration(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
  ): Promise<unknown> {
    return api.get(`${BASE}/saturation/kafka/client-op-duration`, { params: { startTime, endTime } });
  },

  // ── Database ────────────────────────────────────────────────────────────
  async getDatabaseQueryByTable(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
  ): Promise<unknown> {
    return api.get(`${BASE}/saturation/database/query-by-table`, { params: { startTime, endTime } });
  },

  async getDatabaseAvgLatency(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
  ): Promise<unknown> {
    return api.get(`${BASE}/saturation/database/avg-latency`, { params: { startTime, endTime } });
  },

  async getDatabaseCacheSummary(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
  ): Promise<unknown> {
    return api.get(`${BASE}/saturation/database/latency-summary`, { params: { startTime, endTime } });
  },

  async getDatabaseSystemsBreakdown(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
  ): Promise<unknown> {
    return api.get(`${BASE}/saturation/database/systems`, { params: { startTime, endTime } });
  },

  async getDatabaseTopTablesMetrics(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
  ): Promise<unknown> {
    return api.get(`${BASE}/saturation/database/top-tables`, { params: { startTime, endTime } });
  },
};
