import { useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useHotkeys } from 'react-hotkeys-hook';
import { Outlet } from 'react-router-dom';

import ShortcutHelpOverlay from '@shared/components/ui/overlay/ShortcutHelpOverlay';
import { DensityProvider } from '@/components/ui/providers/DensityProvider';
import { useKeyboardShortcuts } from '@shared/hooks/useKeyboardShortcuts';

import { useAppStore } from '@store/appStore';
import { cn } from '@/lib/utils';

import Header from './Header';
import Sidebar from './Sidebar';

function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: unknown;
  resetErrorBoundary: () => void;
}) {
  const message = error instanceof Error ? error.message : 'An unexpected error occurred';
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-6">
      <div className="text-red-400 text-lg font-medium">Something went wrong</div>
      <pre className="text-sm text-[var(--text-secondary)] max-w-xl overflow-auto whitespace-pre-wrap">
        {message}
      </pre>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 rounded-md bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors text-sm"
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

  useHotkeys(
    'shift+/',
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
            'transition-[margin-left] duration-200 ease-linear flex flex-col h-screen',
            'max-md:ml-0',
            sidebarCollapsed
              ? 'ml-[var(--space-sidebar-collapsed,56px)]'
              : 'ml-[var(--space-sidebar-w,220px)]'
          )}
        >
          <Header />
          <main
            className={cn(
              'p-4 max-md:p-3',
              'flex-1 overflow-y-auto',
              'bg-[var(--bg-primary,var(--literal-hex-0a0a0a-2))]',
              'relative z-[1]'
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
      </div>
    </DensityProvider>
  );
}
