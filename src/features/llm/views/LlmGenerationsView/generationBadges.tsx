import { Badge } from "@/components/ui";

export function renderStatus(status: string) {
  const normalized = (status || "UNSET").toUpperCase();
  const variant = normalized === "ERROR" ? "error" : normalized === "OK" ? "success" : "default";
  return <Badge variant={variant}>{normalized}</Badge>;
}

export function renderProviderBadge(provider: string) {
  return (
    <Badge variant="info" className="text-[11px]">
      {provider || "unknown"}
    </Badge>
  );
}
