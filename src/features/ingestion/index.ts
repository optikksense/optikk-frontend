import { DatabaseZap } from "lucide-react";

import type { DomainConfig } from "@/app/registry/domainRegistry";
import { ROUTES } from "@/shared/constants/routes";

// Eager import: the route uses Suspense with a fullscreen Loading fallback; lazy()
// for this page can strand users on "Loading..." if the chunk never resolves.
import IngestionPage from "./pages/IngestionPage";

export const ingestionConfig: DomainConfig = {
  key: "ingestion",
  label: "Ingestion",
  permissions: ["ingestion:read"],
  navigation: [
    {
      path: ROUTES.ingestion,
      label: "Ingestion",
      icon: DatabaseZap,
      group: "operate",
    },
  ],
  routes: [{ path: ROUTES.ingestion, page: IngestionPage }],
};
