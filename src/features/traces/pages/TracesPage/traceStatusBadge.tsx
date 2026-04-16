import { Badge } from "@/components/ui";

export function renderTraceStatus(status: string) {
  const normalized = (status || "UNSET").toUpperCase();
  const variant = normalized === "ERROR" ? "error" : normalized === "OK" ? "success" : "default";
  return <Badge variant={variant}>{normalized}</Badge>;
}
