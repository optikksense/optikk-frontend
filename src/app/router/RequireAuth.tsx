import { Navigate, Outlet } from "@tanstack/react-router"

import { useSession } from "@/platform/auth/use-session"
import { ROUTES } from "@/platform/config/routes"

export function RequireAuth() {
  const session = useSession()

  if (session.isLoading) {
    return <div className="p-6 text-sm text-muted">Loading session…</div>
  }

  if (!session.data) {
    return <Navigate to={ROUTES.login} replace />
  }

  return <Outlet />
}
