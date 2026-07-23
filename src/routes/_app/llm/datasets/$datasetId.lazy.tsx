import { createLazyFileRoute } from "@tanstack/react-router";

import DatasetDetailPage from "@/features/llm/pages/details/DatasetDetailPage";

export const Route = createLazyFileRoute("/_app/llm/datasets/$datasetId")({
  component: () => <DatasetDetailPage />,
});
