/**
 * V1 Service — Backward-compatible barrel that re-exports from domain services.
 *
 * NEW CODE should import from the domain service directly:
 *   import { logsService } from '@services/logsService';
 *   import { tracesService } from '@services/tracesService';
 *
 * This barrel exists solely so existing call-sites (`v1Service.getXxx(…)`)
 * continue to work without a mass rename.
 */
import { aiService } from './aiService';
import { dashboardConfigService } from './dashboardConfigService';
import { deploymentsService } from './deploymentsService';
import { latencyService } from './latencyService';
import { logsService } from './logsService';
import { metricsService } from './metricsService';
import { saturationService } from './saturationService';
import { tracesService } from './tracesService';

export /**
        *
        */
const v1Service = {
  // ── Metrics / Services / Errors / Incidents / Infrastructure ──────────
  ...metricsService,

  // ── Logs ──────────────────────────────────────────────────────────────
  ...logsService,

  // ── Traces ────────────────────────────────────────────────────────────
  ...tracesService,

  // ── AI Observability ──────────────────────────────────────────────────
  // Prefixed aliases so existing call-sites (v1Service.getAiXxx) keep working
  getAiSummary: aiService.getSummary,
  getAiActiveModels: aiService.getActiveModels,
  getAiPerformanceMetrics: aiService.getPerformanceMetrics,
  getAiPerformanceTimeSeries: aiService.getPerformanceTimeSeries,
  getAiLatencyHistogram: aiService.getLatencyHistogram,
  getAiCostMetrics: aiService.getCostMetrics,
  getAiCostTimeSeries: aiService.getCostTimeSeries,
  getAiTokenBreakdown: aiService.getTokenBreakdown,
  getAiSecurityMetrics: aiService.getSecurityMetrics,
  getAiSecurityTimeSeries: aiService.getSecurityTimeSeries,
  getAiPiiCategories: aiService.getPiiCategories,

  // ── Saturation ────────────────────────────────────────────────────────
  ...saturationService,

  // ── Deployments ───────────────────────────────────────────────────────
  ...deploymentsService,

  // ── Latency ───────────────────────────────────────────────────────────
  getLatencyHistogram: latencyService.getHistogram,
  getLatencyHeatmap: latencyService.getHeatmap,

  // ── Dashboard Config ──────────────────────────────────────────────────
  ...dashboardConfigService,
};
