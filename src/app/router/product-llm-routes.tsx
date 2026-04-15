import { createRoute } from "@tanstack/react-router"

import { protectedRoute } from "@/app/router/base-routes"
import { createLlmSectionPage } from "@/app/router/route-components"

function createLlmRoute(path: string, section: string) {
  return createRoute({
    getParentRoute: () => protectedRoute,
    path,
    component: createLlmSectionPage(section),
  })
}

export const llmRoutes = [
  createLlmRoute("llm/overview", "overview"),
  createLlmRoute("llm/traces", "traces"),
  createLlmRoute("llm/generations", "generations"),
  createLlmRoute("llm/sessions", "sessions"),
  createLlmRoute("llm/scores", "scores"),
  createLlmRoute("llm/prompts", "prompts"),
  createLlmRoute("llm/datasets", "datasets"),
  createLlmRoute("llm/settings", "settings"),
]
