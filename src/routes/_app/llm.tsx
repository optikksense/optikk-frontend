import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const LlmPage = lazy(() => import("@/features/llm/pages/LlmPage"));

export const Route = createFileRoute("/_app/llm")({
  component: () => <LlmPage />,
});
