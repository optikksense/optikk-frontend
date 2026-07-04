import { createFileRoute } from "@tanstack/react-router";

import IngestionPage from "@/features/ingestion/pages/IngestionPage";

export const Route = createFileRoute("/_app/ingestion")({
  component: () => (
        <IngestionPage />

  ),
});
