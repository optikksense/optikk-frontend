import { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Outlet } from 'react-router-dom';

import CommandPalette from '@shared/components/ui/overlay/CommandPalette';
import ShortcutHelpOverlay from '@shared/components/ui/overlay/ShortcutHelpOverlay';
import { DensityProvider } from '@/components/ui/providers/DensityProvider';
import { useKeyboardShortcuts } from '@shared/hooks/useKeyboardShortcuts';

import { useAppStore } from '@store/appStore';
import { cn } from '@/lib/utils';

import Header from './Header';
import Sidebar from './Sidebar';

export default function MainLayout() {
  const sidebarCollapsed = useAppStore((state) => state.sidebarCollapsed);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [shortcutHelpOpen, setShortcutHelpOpen] = useState(false);
  const { shortcuts } = useKeyboardShortcuts();

  useHotkeys('mod+k', (e) => {
    e.preventDefault();
    setCommandPaletteOpen((prev) => !prev);
  }, { enableOnFormTags: true });

  useHotkeys('shift+/', (e) => {
    e.preventDefault();
    setShortcutHelpOpen((prev) => !prev);
  }, { enableOnFormTags: false });

  return (
    <DensityProvider>
      <div className="min-h-screen bg-[var(--bg-primary,var(--literal-hex-0a0a0a-2))]">
        <Sidebar />
        <div
          className={cn(
            'transition-[margin-left] duration-200 ease-linear',
            'max-md:ml-0',
            sidebarCollapsed
              ? 'ml-[var(--space-sidebar-collapsed,56px)]'
              : 'ml-[var(--space-sidebar-w,220px)]',
          )}
        >
          <Header />
          <main
            className={cn(
              'p-4 max-md:p-3',
              'min-h-[calc(100vh-var(--space-header-h,56px))]',
              'bg-[var(--bg-primary,var(--literal-hex-0a0a0a-2))]',
              'relative z-[1]',
            )}
          >
            <Outlet />
          </main>
        </div>
        <CommandPalette
          open={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
        />
        <ShortcutHelpOverlay
          open={shortcutHelpOpen}
          onClose={() => setShortcutHelpOpen(false)}
          shortcuts={shortcuts}
        />
      </div>
    </DensityProvider>
  );
}
