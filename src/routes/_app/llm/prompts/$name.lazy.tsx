import { createLazyFileRoute } from "@tanstack/react-router";

import PromptDetailPage from "@/features/llm/pages/details/PromptDetailPage";

export const Route = createLazyFileRoute("/_app/llm/prompts/$name")({
  component: () => <PromptDetailPage />,
});
