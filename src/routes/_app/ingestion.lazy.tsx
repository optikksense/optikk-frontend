import { createLazyFileRoute } from "@tanstack/react-router";

import IngestionPage from "@/features/ingestion/pages/IngestionPage/IngestionPage";

export const Route = createLazyFileRoute("/_app/ingestion")({
  component: () => <IngestionPage />,
});
