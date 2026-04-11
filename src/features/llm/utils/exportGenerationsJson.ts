import type { LlmGenerationRecord } from "../types";

export function downloadGenerationsAsJson(
  rows: readonly LlmGenerationRecord[],
  filenameBase = "llm-generations"
): void {
  const payload = rows.map(({ estimated_cost: _ec, ...rest }) => rest);
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filenameBase}-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
