const STORAGE_KEY_PREFIX = "optik.llm.pricingOverrides.v1.";

export type LlmPricingOverrideRow = { inputPer1K: number; outputPer1K: number };

export function loadLlmPricingOverrides(
  teamId: number | null | undefined
): Record<string, LlmPricingOverrideRow> {
  if (teamId == null) return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + String(teamId));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed as Record<string, LlmPricingOverrideRow>;
  } catch {
    return {};
  }
}

export function saveLlmPricingOverrides(
  teamId: number | null | undefined,
  overrides: Record<string, LlmPricingOverrideRow>
): void {
  if (teamId == null) return;
  localStorage.setItem(STORAGE_KEY_PREFIX + String(teamId), JSON.stringify(overrides));
}
