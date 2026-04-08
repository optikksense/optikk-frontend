import { useAuthStore } from "@/app/store/authStore";

export function useFeatureFlag(flag: string): boolean {
  const tenantFeatures = useAuthStore((s: any) => s.tenant?.features ?? []);

  // Priority 1: localStorage override (dev local)
  const localOverride = localStorage.getItem(`flag:${flag}`);
  if (localOverride !== null) {
    return localOverride === "true";
  }

  // Priority 2: Tenant payload list (production)
  return tenantFeatures.includes(flag);
}
