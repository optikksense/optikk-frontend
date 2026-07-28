import { Outlet } from "@tanstack/react-router";
import { useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useHotkeys } from "react-hotkeys-hook";

import { DensityProvider } from "@shared/components/primitives/ui/providers/DensityProvider";
import CommandPalette from "@shared/components/ui/overlay/CommandPalette/CommandPalette";
import ShortcutHelpOverlay from "@shared/components/ui/overlay/ShortcutHelpOverlay";
import { useAppRefreshSubscriber } from "@shared/hooks/useAppRefreshSubscriber";
import { useKeyboardShortcuts } from "@shared/hooks/useKeyboardShortcuts";

import { useAppStore } from "@app/store/appStore";
import { cn } from "@shared/lib/utils";

import { TrialBanner } from "@/features/onboarding/TrialBanner";

import Header from "./Header";
import Sidebar from "./Sidebar";

function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: unknown;
  resetErrorBoundary: () => void;
}) {
  const message = error instanceof Error ? error.message : "An unexpected error occurred";
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="font-medium text-error text-lg">Something went wrong</div>
      <pre className="max-w-xl overflow-auto whitespace-pre-wrap text-foreground-secondary text-sm">
        {message}
      </pre>
      <button
        type="button"
        onClick={resetErrorBoundary}
        className="rounded-md bg-muted px-4 py-2 text-foreground text-sm transition-colors hover:bg-accent"
      >
        Try again
      </button>
    </div>
  );
}

export default function MainLayout() {
  const sidebarCollapsed = useAppStore((state) => state.sidebarCollapsed);
  const [shortcutHelpOpen, setShortcutHelpOpen] = useState(false);
  const { shortcuts } = useKeyboardShortcuts();
  useAppRefreshSubscriber();

  useHotkeys(
    "shift+/",
    (e) => {
      e.preventDefault();
      setShortcutHelpOpen((prev) => !prev);
    },
    { enableOnFormTags: false }
  );

  return (
    <DensityProvider>
      <div className="h-screen bg-[var(--bg-primary,var(--literal-hex-0a0a0a-2))]">
        <Sidebar />
        <div
          className={cn(
            "flex h-screen flex-col transition-[margin-left] duration-200 ease-linear",
            "max-md:ml-0",
            sidebarCollapsed
              ? "ml-[var(--space-sidebar-collapsed,56px)]"
              : "ml-[var(--space-sidebar-w,220px)]"
          )}
        >
          <Header />
          <TrialBanner />
          <main
            className={cn(
              "p-4 max-md:p-3",
              "flex-1 overflow-y-auto",
              "bg-[var(--bg-primary,var(--literal-hex-0a0a0a-2))]",
              "relative z-[1]"
            )}
          >
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <Outlet />
            </ErrorBoundary>
          </main>
        </div>
        <ShortcutHelpOverlay
          open={shortcutHelpOpen}
          onClose={() => setShortcutHelpOpen(false)}
          shortcuts={shortcuts}
        />
        <CommandPalette />
      </div>
    </DensityProvider>
  );
}
