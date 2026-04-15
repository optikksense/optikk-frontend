import { Link, Outlet } from "@tanstack/react-router"

import { Button } from "@/design-system/button"
import { ROUTES } from "@/platform/config/routes"

export function MarketingLayout() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#123456_0%,#07111d_55%)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link className="text-lg font-semibold" to={ROUTES.home}>
          Optikk
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => window.location.assign(ROUTES.pricing)}>
            Pricing
          </Button>
          <Button onClick={() => window.location.assign(ROUTES.login)}>Login</Button>
        </div>
      </div>
      <main className="mx-auto max-w-7xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  )
}
