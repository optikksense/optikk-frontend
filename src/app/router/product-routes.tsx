import { alertRoutes } from "@/app/router/product-alert-routes"
import { legacyRoutes } from "@/app/router/product-legacy-routes"
import { llmRoutes } from "@/app/router/product-llm-routes"
import { observabilityRoutes } from "@/app/router/product-observability-routes"

export const productRoutes = [...observabilityRoutes, ...llmRoutes, ...alertRoutes, ...legacyRoutes]
