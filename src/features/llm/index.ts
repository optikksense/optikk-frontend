import { Sparkles } from "lucide-react";

import type { DomainConfig } from "@/app/registry/domainRegistry";
import { ROUTES } from "@/shared/constants/routes";

export const llmConfig: DomainConfig = {
  key: "llm",
  label: "LLM",
  navigation: [{ path: ROUTES.llm, label: "LLM", icon: Sparkles, group: "telemetry" }],
};
