import { useStandardQuery } from "@/shared/hooks/useStandardQuery";

import {
  type Integration,
  type Policy,
  type Template,
  listIntegrations,
  listPolicies,
  listTemplates,
} from "../api/notificationsApi";

export function useIntegrations() {
  return useStandardQuery<Integration[]>({
    queryKey: ["notifications", "integrations"],
    queryFn: () => listIntegrations(),
  });
}

export function usePolicies() {
  return useStandardQuery<Policy[]>({
    queryKey: ["notifications", "policies"],
    queryFn: () => listPolicies(),
  });
}

export function useTemplates() {
  return useStandardQuery<Template[]>({
    queryKey: ["notifications", "templates"],
    queryFn: () => listTemplates(),
  });
}
