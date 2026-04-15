import { Outlet, useNavigate } from "@tanstack/react-router"
import { Command } from "cmdk"
import { useState } from "react"

import { AppHeader } from "@/app/layout/AppHeader"
import { AppSidebar } from "@/app/layout/AppSidebar"
import { ROUTES } from "@/platform/config/routes"

export function AppShell() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  return (
    <div className="grid min-h-screen grid-cols-[auto_1fr] bg-canvas">
      <AppSidebar />
      <div className="min-h-screen">
        <AppHeader />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
      <button
        className="fixed right-6 bottom-6 rounded-full border border-border bg-panel px-4 py-2 text-sm"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        Command
      </button>
      {open ? (
        <Command className="fixed inset-x-0 top-20 mx-auto max-w-xl rounded-2xl border border-border bg-panel p-3 shadow-panel">
          <Command.Input
            className="w-full bg-transparent py-2 outline-none"
            placeholder="Jump to route"
          />
          <Command.List>
            {[ROUTES.logs, ROUTES.traces, ROUTES.metrics, ROUTES.llmOverview].map((route) => (
              <Command.Item key={route} onSelect={() => navigate({ to: route })}>
                {route}
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      ) : null}
    </div>
  )
}
