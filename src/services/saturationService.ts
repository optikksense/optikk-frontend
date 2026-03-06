/**
 * Saturation Service — API calls for Kafka, database, and queue saturation monitoring.
 */
import { API_CONFIG } from '@config/constants';

import api from './api';

import type { RequestTime } from './service-types';

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

/**
 * Service wrapper for saturation endpoints.
 */
export const saturationService = {
  // ── Kafka ───────────────────────────────────────────────────────────────
  async getKafkaQueueLag(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
  ): Promise<unknown> {
    return api.get(`${BASE}/saturation/kafka/queue-lag`, { params: { startTime, endTime } });
  },

  async getKafkaProductionRate(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
  ): Promise<unknown> {
    return api.get(`${BASE}/saturation/kafka/production-rate`, { params: { startTime, endTime } });
  },

  async getKafkaConsumptionRate(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
  ): Promise<unknown> {
    return api.get(`${BASE}/saturation/kafka/consumption-rate`, { params: { startTime, endTime } });
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

  // ── Queue ───────────────────────────────────────────────────────────────
  async getQueueConsumerLag(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
  ): Promise<unknown> {
    return api.get(`${BASE}/saturation/queue/consumer-lag`, { params: { startTime, endTime } });
  },

  async getQueueTopicLag(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
  ): Promise<unknown> {
    return api.get(`${BASE}/saturation/queue/topic-lag`, { params: { startTime, endTime } });
  },

  async getQueueTopQueuesStats(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
  ): Promise<unknown> {
    return api.get(`${BASE}/saturation/queue/top-queues`, { params: { startTime, endTime } });
  },
};
