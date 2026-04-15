import { useNavigate } from "@tanstack/react-router";
import { BellPlus } from "lucide-react";

import { Button } from "@shared/components/primitives/ui/button";

import { ROUTES } from "@/shared/constants/routes";

import type { AlertPrefill } from "../types";

export interface CreateAlertButtonProps {
  readonly prefill?: AlertPrefill;
  readonly label?: string;
  readonly size?: "sm" | "md";
  readonly variant?: "ghost" | "secondary" | "primary";
  readonly className?: string;
}

export function buildAlertBuilderSearch(prefill?: AlertPrefill): string {
  const params = new URLSearchParams();
  if (!prefill) return "";

  if (prefill.presetKind) params.set("presetKind", prefill.presetKind);
  if (prefill.serviceName) params.set("serviceName", prefill.serviceName);
  if (prefill.environment) params.set("environment", prefill.environment);
  if (prefill.sloId) params.set("sloId", prefill.sloId);
  if (prefill.url) params.set("url", prefill.url);
  if (prefill.provider) params.set("provider", prefill.provider);
  if (prefill.model) params.set("model", prefill.model);
  if (prefill.promptTemplate) params.set("promptTemplate", prefill.promptTemplate);

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function CreateAlertButton({
  prefill,
  label = "Create alert",
  size = "sm",
  variant = "ghost",
  className,
}: CreateAlertButtonProps) {
  const navigate = useNavigate();
  return (
    <Button
      variant={variant}
      size={size}
      icon={<BellPlus size={14} />}
      className={className}
      onClick={() => {
        const search = buildAlertBuilderSearch(prefill);
        navigate({ to: `${ROUTES.alertRuleNew}${search}` as never });
      }}
    >
      {label}
    </Button>
  );
}
