import { createRootRoute, Outlet } from "@tanstack/react-router";
import { CommandPalette } from "@/app/layout/CommandPalette";
import SessionExpiryRedirect from "@/app/providers/SessionExpiryRedirect";
import { Loading } from "@/shared/components/ui/feedback";
import { AlertCircle } from "lucide-react";
import { Button } from "@/shared/components/primitives/ui";

function RootErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-[var(--bg-surface)] p-6">
      <AlertCircle color="var(--color-error, #ef4444)" className="mb-4" size={48} />
      <h2 className="mb-2 text-xl font-semibold text-[var(--color-error)]">Unexpected Error</h2>
      <p className="mb-6 text-sm text-[var(--text-secondary)]">{error.message}</p>
      <Button variant="secondary" onClick={reset}>Try Again</Button>
    </div>
  );
}

export const Route = createRootRoute({
  pendingComponent: () => <Loading fullscreen />,
  errorComponent: RootErrorComponent,
  component: () => (
    <>
      <SessionExpiryRedirect />
      <CommandPalette />
      <Outlet />
    </>
  ),
});
