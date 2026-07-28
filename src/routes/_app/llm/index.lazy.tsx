import { createLazyFileRoute } from "@tanstack/react-router";

import LlmPage from "@/features/llm/pages/LlmPage/LlmPage";

export const Route = createLazyFileRoute("/_app/llm/")({
  component: () => <LlmPage />,
});
