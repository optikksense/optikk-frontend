/**
 * V1 Service - API calls for ClickHouse-backed observability endpoints
 */
import api from './api';
import { API_CONFIG } from '@config/constants';

// Base path for all v1 ClickHouse-backed endpoints
const BASE = API_CONFIG.ENDPOINTS.V1.SERVICES_METRICS;

export const v1Service = {
  // ==================== METRICS ====================

  async getServiceMetrics(teamId, startTime, endTime) {
    return api.get(`${BASE}/services/metrics`, { params: { startTime, endTime } });
  },

  async getEndpointMetrics(teamId, startTime, endTime, serviceName) {
    return api.get(`${BASE}/endpoints/metrics`, { params: { startTime, endTime, serviceName } });
  },

  async getEndpointTimeSeries(teamId, startTime, endTime, serviceName) {
    return api.get(`${BASE}/endpoints/timeseries`, { params: { startTime, endTime, serviceName } });
  },

  async getMetricsTimeSeries(teamId, startTime, endTime, serviceName, interval) {
    return api.get(`${BASE}/metrics/timeseries`, { params: { startTime, endTime, serviceName, interval } });
  },

  async getMetricsSummary(teamId, startTime, endTime) {
    return api.get(`${BASE}/metrics/summary`, { params: { startTime, endTime } });
  },

  async getServiceTimeSeries(teamId, startTime, endTime, interval = '5m') {
    return api.get(`${BASE}/services/timeseries`, { params: { startTime, endTime, interval } });
  },

  // ==================== LOGS ====================

  async getLogs(teamId, startTime, endTime, params = {}) {
    return api.get(`${BASE}/logs`, { params: { startTime, endTime, ...params } });
  },

  async getLogHistogram(teamId, startTime, endTime, interval = '1m') {
    return api.get(`${BASE}/logs/histogram`, { params: { startTime, endTime, step: interval } });
  },

  async getLogDetail(teamId, traceId, spanId, timestamp, contextWindow = 30) {
    return api.get(`${BASE}/logs/detail`, { params: { traceId, spanId, timestamp, contextWindow } });
  },

  async getLogStats(teamId, startTime, endTime, params = {}) {
    return api.get(`${BASE}/logs/stats`, { params: { startTime, endTime, ...params } });
  },

  async getLogVolume(teamId, startTime, endTime, step, params = {}) {
    return api.get(`${BASE}/logs/volume`, { params: { startTime, endTime, step, ...params } });
  },

  async getLogFields(teamId, startTime, endTime, field, params = {}) {
    return api.get(`${BASE}/logs/fields`, { params: { startTime, endTime, field, ...params } });
  },

  async getLogSurrounding(teamId, logId, before = 10, after = 10) {
    return api.get(`${BASE}/logs/surrounding`, { params: { id: logId, before, after } });
  },

  // ==================== TRACES ====================

  async getTraces(teamId, startTime, endTime, params = {}) {
    return api.get(`${BASE}/traces`, { params: { startTime, endTime, ...params } });
  },

  async getTraceSpans(teamId, traceId) {
    return api.get(`${BASE}/traces/${traceId}/spans`);
  },

  async getTraceLogs(teamId, traceId) {
    return api.get(`${BASE}/traces/${traceId}/logs`);
  },

  // ==================== SERVICES ====================

  async getServiceDependencies(teamId, startTime, endTime) {
    return api.get(`${BASE}/services/dependencies`, { params: { startTime, endTime } });
  },

  async getEndpointBreakdown(teamId, startTime, endTime, serviceName) {
    return api.get(`${BASE}/services/${serviceName}/endpoints`, { params: { startTime, endTime } });
  },

  async getErrorGroups(teamId, startTime, endTime, serviceName) {
    return api.get(`${BASE}/services/${serviceName}/errors`, { params: { startTime, endTime } });
  },

  // ==================== ERROR DASHBOARD ====================

  async getGlobalErrorGroups(teamId, startTime, endTime, params = {}) {
    return api.get(`${BASE}/errors/groups`, { params: { startTime, endTime, ...params } });
  },

  async getErrorTimeSeries(teamId, startTime, endTime, interval = '5m', serviceName) {
    return api.get(`${BASE}/errors/timeseries`, { params: { startTime, endTime, interval, serviceName } });
  },

  // ==================== SATURATION ====================

  async getSaturationMetrics(teamId, startTime, endTime) {
    return api.get(`${BASE}/saturation/metrics`, { params: { startTime, endTime } });
  },

  async getSaturationTimeSeries(teamId, startTime, endTime, interval = '5m') {
    return api.get(`${BASE}/saturation/timeseries`, { params: { startTime, endTime, interval } });
  },

  // ==================== INCIDENTS ====================

  async getIncidents(teamId, startTime, endTime, params = {}) {
    return api.get(`${BASE}/incidents`, { params: { startTime, endTime, ...params } });
  },

  // ==================== OPERATIONAL INSIGHTS ====================

  async getResourceUtilization(teamId, startTime, endTime) {
    return api.get(`${BASE}/insights/resource-utilization`, { params: { startTime, endTime } });
  },

  async getSloSli(teamId, startTime, endTime, serviceName, interval = '5m') {
    return api.get(`${BASE}/insights/slo-sli`, { params: { startTime, endTime, serviceName, interval } });
  },

  async getLogsStreamInsights(teamId, startTime, endTime, interval = '1m', limit = 200) {
    return api.get(`${BASE}/insights/logs-stream`, { params: { startTime, endTime, interval, limit } });
  },

  async getDatabaseCacheInsights(teamId, startTime, endTime) {
    return api.get(`${BASE}/insights/database-cache`, { params: { startTime, endTime } });
  },

  async getMessagingQueueInsights(teamId, startTime, endTime, interval = '5m') {
    return api.get(`${BASE}/insights/messaging-queue`, { params: { startTime, endTime, interval } });
  },

  // ==================== AI OBSERVABILITY ====================

  async getAiSummary(teamId, startTime, endTime) {
    return api.get(`${BASE}/ai/summary`, { params: { startTime, endTime } });
  },

  async getAiActiveModels(teamId, startTime, endTime) {
    return api.get(`${BASE}/ai/models`, { params: { startTime, endTime } });
  },

  async getAiPerformanceMetrics(teamId, startTime, endTime) {
    return api.get(`${BASE}/ai/performance/metrics`, { params: { startTime, endTime } });
  },

  async getAiPerformanceTimeSeries(teamId, startTime, endTime, interval = '5m') {
    return api.get(`${BASE}/ai/performance/timeseries`, { params: { startTime, endTime, interval } });
  },

  async getAiLatencyHistogram(teamId, startTime, endTime, modelName) {
    return api.get(`${BASE}/ai/performance/latency-histogram`, { params: { startTime, endTime, modelName } });
  },

  async getAiCostMetrics(teamId, startTime, endTime) {
    return api.get(`${BASE}/ai/cost/metrics`, { params: { startTime, endTime } });
  },

  async getAiCostTimeSeries(teamId, startTime, endTime, interval = '5m') {
    return api.get(`${BASE}/ai/cost/timeseries`, { params: { startTime, endTime, interval } });
  },

  async getAiTokenBreakdown(teamId, startTime, endTime) {
    return api.get(`${BASE}/ai/cost/token-breakdown`, { params: { startTime, endTime } });
  },

  async getAiSecurityMetrics(teamId, startTime, endTime) {
    return api.get(`${BASE}/ai/security/metrics`, { params: { startTime, endTime } });
  },

  async getAiSecurityTimeSeries(teamId, startTime, endTime, interval = '5m') {
    return api.get(`${BASE}/ai/security/timeseries`, { params: { startTime, endTime, interval } });
  },

  async getAiPiiCategories(teamId, startTime, endTime) {
    return api.get(`${BASE}/ai/security/pii-categories`, { params: { startTime, endTime } });
  },

  // ==================== DEPLOYMENTS ====================

  async getDeployments(teamId, startTime, endTime, params = {}) {
    return api.get(`${BASE}/deployments`, { params: { startTime, endTime, ...params } });
  },

  async getDeployEvents(teamId, startTime, endTime, serviceName) {
    return api.get(`${BASE}/deployments/events`, { params: { startTime, endTime, serviceName } });
  },

  async getDeployDiff(teamId, deployId, windowMinutes = 30) {
    return api.get(`${BASE}/deployments/${deployId}/diff`, { params: { windowMinutes } });
  },

  async createDeployment(teamId, data) {
    return api.post(`${BASE}/deployments`, data);
  },

  // ==================== LATENCY ANALYSIS ====================

  async getLatencyHistogram(teamId, startTime, endTime, params = {}) {
    return api.get(`${BASE}/latency/histogram`, { params: { startTime, endTime, ...params } });
  },

  async getLatencyHeatmap(teamId, startTime, endTime, serviceName, interval = '5m') {
    return api.get(`${BASE}/latency/heatmap`, { params: { startTime, endTime, serviceName, interval } });
  },

  // ==================== INFRASTRUCTURE NODES ====================

  async getNodeHealth(teamId, startTime, endTime) {
    return api.get(`${BASE}/infrastructure/nodes`, { params: { startTime, endTime } });
  },

  async getNodeServices(teamId, host, startTime, endTime) {
    return api.get(`${BASE}/infrastructure/nodes/${encodeURIComponent(host)}/services`, {
      params: { startTime, endTime },
    });
  },

  // ==================== HEALTH CHECKS ====================

  async getHealthChecks(teamId) {
    return api.get(`${BASE}/health-checks`);
  },

  async createHealthCheck(teamId, data) {
    return api.post(`${BASE}/health-checks`, data);
  },

  async updateHealthCheck(teamId, id, data) {
    return api.put(`${BASE}/health-checks/${id}`, data);
  },

  async deleteHealthCheck(teamId, id) {
    return api.delete(`${BASE}/health-checks/${id}`);
  },

  async toggleHealthCheck(teamId, id) {
    return api.patch(`${BASE}/health-checks/${id}/toggle`);
  },

  async getHealthCheckStatus(teamId, startTime, endTime) {
    return api.get(`${BASE}/health-checks/status`, { params: { startTime, endTime } });
  },

  async getHealthCheckResults(teamId, checkId, startTime, endTime, params = {}) {
    return api.get(`${BASE}/health-checks/${checkId}/results`, {
      params: { startTime, endTime, ...params },
    });
  },

  async getHealthCheckTrend(teamId, checkId, startTime, endTime, interval = '5m') {
    return api.get(`${BASE}/health-checks/${checkId}/trend`, {
      params: { startTime, endTime, interval },
    });
  },

  // ==================== DASHBOARD CONFIG ====================

  async getDashboardConfig(teamId, pageId) {
    return api.get(`${BASE}/dashboard-config/${pageId}`);
  },

  async saveDashboardConfig(teamId, pageId, configYaml) {
    return api.put(`${BASE}/dashboard-config/${pageId}`, { configYaml });
  },

  async listDashboardPages(teamId) {
    return api.get(`${BASE}/dashboard-config/pages`);
  },
};
