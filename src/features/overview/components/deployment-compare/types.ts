export interface DeploymentSeed {
  serviceName: string;
  version: string;
  environment: string;
  deployedAtMs: number;
  lastSeenAtMs: number | null;
  isActive: boolean;
}

export interface TimelineSeries {
  label: string;
  values: Array<number | null>;
  color: string;
}
