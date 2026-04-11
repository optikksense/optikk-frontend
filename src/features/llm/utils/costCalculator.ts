import { MODEL_PRICING } from "../constants";

import { loadLlmPricingOverrides } from "./llmPricingStorage";

export type LlmCostContext = {
  teamId?: number | null;
  serverOverrides?: Record<string, { inputPer1K: number; outputPer1K: number }> | null;
};

export function estimateCost(
  model: string,
  inputTokens: number,
  outputTokens: number,
  ctx?: LlmCostContext | null
): number {
  const pricing = findPricing(model, ctx);
  if (!pricing) return 0;
  return (inputTokens / 1000) * pricing.inputPer1K + (outputTokens / 1000) * pricing.outputPer1K;
}

function pickFromMap(
  modelLower: string,
  m: Record<string, { inputPer1K: number; outputPer1K: number }>
): { inputPer1K: number; outputPer1K: number } | undefined {
  if (m[modelLower]) return m[modelLower];
  const keys = Object.keys(m).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (modelLower.startsWith(key)) return m[key];
  }
  return undefined;
}

function findPricing(model: string, ctx?: LlmCostContext | null): { inputPer1K: number; outputPer1K: number } | undefined {
  if (!model) return undefined;

  const lower = model.toLowerCase();

  const server = ctx?.serverOverrides;
  if (server && Object.keys(server).length > 0) {
    const hit = pickFromMap(lower, server);
    if (hit) return hit;
  }

  const local = loadLlmPricingOverrides(ctx?.teamId ?? null);
  if (Object.keys(local).length > 0) {
    const hit = pickFromMap(lower, local);
    if (hit) return hit;
  }

  if (MODEL_PRICING[lower]) return MODEL_PRICING[lower];

  const keys = Object.keys(MODEL_PRICING).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (lower.startsWith(key)) return MODEL_PRICING[key];
  }

  return undefined;
}

export function formatCost(cost: number): string {
  if (cost === 0) return "$0.00";
  if (cost < 0.01) return `$${cost.toFixed(4)}`;
  if (cost < 1) return `$${cost.toFixed(3)}`;
  return `$${cost.toFixed(2)}`;
}
