import { Link, useLocation } from "@tanstack/react-router"
import { BarChart3, Bell, Brain, Gauge, LayoutDashboard, Server, Settings } from "lucide-react"

import { ROUTES } from "@/platform/config/routes"
import { useUiStore } from "@/platform/state/ui-store"
import { cn } from "@/platform/utils/cn"

const items = [
  { icon: LayoutDashboard, label: "Overview", to: ROUTES.overview },
  { icon: Server, label: "Service", to: ROUTES.service },
  { icon: BarChart3, label: "Metrics", to: ROUTES.metrics },
  { icon: Gauge, label: "Saturation", to: ROUTES.saturation },
  { icon: Brain, label: "LLM", to: ROUTES.llmOverview },
  { icon: Bell, label: "Alerts", to: ROUTES.alerts },
  { icon: Settings, label: "Settings", to: ROUTES.settings },
]

export function AppSidebar() {
  const collapsed = useUiStore((state) => state.sidebarCollapsed)
  const toggleSidebar = useUiStore((state) => state.toggleSidebar)
  const location = useLocation()

  return (
    <aside
      className={cn(
        "border-r border-border bg-panelAlt/80 transition-all",
        collapsed ? "w-20" : "w-64",
      )}
    >
      <div className="flex items-center justify-between px-4 py-5">
        <span className={cn("font-semibold", collapsed && "hidden")}>Optikk</span>
        <button className="text-xs text-muted" onClick={toggleSidebar} type="button">
          {collapsed ? "Open" : "Hide"}
        </button>
      </div>
      <nav className="grid gap-1 px-3">
        {items.map((item) => {
          const Icon = item.icon
          const active = location.pathname.startsWith(item.to)
          return (
            <Link
              key={item.to}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted transition",
                active && "bg-accentSoft text-text",
              )}
              to={item.to}
            >
              <Icon size={16} />
              <span className={cn(collapsed && "hidden")}>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
