import type { FeatureFlags } from "@/config/featureFlags";
import { useFeatureFlag } from "@/shared/hooks/useFeatureFlag";
import type React from "react";

export interface FlagGatedProps {
  feature: keyof FeatureFlags;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function FlagGated({ feature, fallback = null, children }: FlagGatedProps) {
  const isEnabled = useFeatureFlag(feature);

  if (!isEnabled) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
