export interface FeatureFlags {
  enableNewTraceView: boolean;
  enableAdvancedMetrics: boolean;
}

export const defaultFeatureFlags: FeatureFlags = {
  enableNewTraceView: false,
  enableAdvancedMetrics: false,
};
