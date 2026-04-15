import { createRoute, createRouter, redirect } from "@tanstack/react-router"

import { appRoute, marketingLayoutRoute, protectedRoute, rootRoute } from "@/app/router/base-routes"
import { marketingRoutes } from "@/app/router/marketing-routes"
import { productRoutes } from "@/app/router/product-routes"
import { ROUTES } from "@/platform/config/routes"

const routeTree = rootRoute.addChildren([
  marketingLayoutRoute.addChildren(marketingRoutes),
  createRoute({
    getParentRoute: () => rootRoute,
    path: "product",
    loader: () => {
      throw redirect({ to: ROUTES.pricing, replace: true })
    },
  }),
  appRoute.addChildren([protectedRoute.addChildren(productRoutes)]),
])

export const router = createRouter({ routeTree })
