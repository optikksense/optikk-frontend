export interface SummaryMetric {
  key: string;
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "success" | "warning" | "danger" | "accent";
}

export interface FacetBucket {
  value: string;
  count: number;
}

export interface FacetGroup {
  key: string;
  label: string;
  buckets: FacetBucket[];
}

export interface LiveTailEnvelope<Item> {
  item?: Item;
  lagMs?: number;
  droppedCount?: number;
  status?: string;
  reason?: string;
  message?: string;
}

export interface PremiumMotionTokens {
  readonly enterDuration: number;
  readonly exitDuration: number;
  readonly stagger: number;
}

export const PREMIUM_MOTION_TOKENS: PremiumMotionTokens = {
  enterDuration: 0.22,
  exitDuration: 0.16,
  stagger: 0.05,
};
