// "Create alert from this view" entry point. Drops on any surface with a
// chartable signal and deep-links into the rule builder with target_ref +
// group_by pre-filled via URL search params.

import { useNavigate } from "@tanstack/react-router";
import { BellPlus } from "lucide-react";

import { Button } from "@shared/components/primitives/ui/button";

import { ROUTES } from "@/shared/constants/routes";

import type { AlertConditionType, AlertTargetRef } from "../types";

export interface CreateAlertButtonProps {
  readonly target?: AlertTargetRef;
  readonly groupBy?: readonly string[];
  readonly condition?: AlertConditionType;
  readonly label?: string;
  readonly size?: "sm" | "md";
  readonly variant?: "ghost" | "secondary" | "primary";
  readonly className?: string;
}

/**
 * Builds the URL search string for the alert rule builder prefill.
 */
export function buildAlertBuilderSearch(
  target?: AlertTargetRef,
  groupBy?: readonly string[],
  condition?: AlertConditionType
): string {
  const params = new URLSearchParams();
  if (target && Object.keys(target).length > 0) {
    params.set("target", JSON.stringify(target));
  }
  if (groupBy && groupBy.length > 0) {
    params.set("groupBy", groupBy.join(","));
  }
  if (condition) {
    params.set("condition", condition);
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function CreateAlertButton({
  target,
  groupBy,
  condition,
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
        const search = buildAlertBuilderSearch(target, groupBy, condition);
        navigate({ to: `${ROUTES.alertRuleNew}${search}` as never });
      }}
    >
      {label}
    </Button>
  );
}
