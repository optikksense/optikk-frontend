export const LLM_TABS = [
  "dashboard",
  "traces",
  "sessions",
  "users",
  "prompts",
  "datasets",
  "evaluators",
  "playground",
] as const;

export type LlmTab = (typeof LLM_TABS)[number];

export const DEFAULT_LLM_TAB: LlmTab = "dashboard";

export function isLlmTab(value: unknown): value is LlmTab {
  return typeof value === "string" && (LLM_TABS as readonly string[]).includes(value);
}
