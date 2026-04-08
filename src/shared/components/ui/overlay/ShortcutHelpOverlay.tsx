import { Keyboard } from "lucide-react";

import { Modal } from "@/components/ui";

import type { KeyboardShortcut } from "@shared/hooks/useKeyboardShortcuts";

interface ShortcutHelpOverlayProps {
  open: boolean;
  onClose: () => void;
  shortcuts: KeyboardShortcut[];
}

export default function ShortcutHelpOverlay({
  open,
  onClose,
  shortcuts,
}: ShortcutHelpOverlayProps): JSX.Element {
  const groups = shortcuts.reduce<Record<string, KeyboardShortcut[]>>((accumulator, shortcut) => {
    accumulator[shortcut.section] ??= [];
    accumulator[shortcut.section].push(shortcut);
    return accumulator;
  }, {});

  return (
    <Modal open={open} onClose={onClose} title="Keyboard Shortcuts" width={640} footer={null}>
      <div className="space-y-5">
        <div className="flex items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-4 py-3 text-[var(--text-secondary)] text-sm">
          <Keyboard size={16} className="text-[var(--color-primary)]" />
          <span>
            Shortcuts are optimized for dense observability workflows. Avoid using them inside
            focused inputs.
          </span>
        </div>

        {Object.entries(groups).map(([section, sectionShortcuts]) => (
          <div key={section} className="space-y-2">
            <h3 className="font-semibold text-[var(--text-muted)] text-xs uppercase tracking-[0.08em]">
              {section}
            </h3>
            <div className="overflow-hidden rounded-lg border border-[var(--border-color)]">
              {sectionShortcuts.map((shortcut) => (
                <div
                  key={shortcut.id}
                  className="flex items-center justify-between gap-3 border-[var(--border-color)] border-b bg-[var(--bg-secondary)] px-4 py-3 last:border-b-0"
                >
                  <span className="text-[var(--text-primary)] text-sm">{shortcut.description}</span>
                  <span className="flex items-center gap-1">
                    {shortcut.keys.map((key) => (
                      <kbd
                        key={`${shortcut.id}-${key}`}
                        className="rounded border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-2 py-1 font-mono text-[11px] text-[var(--text-secondary)]"
                      >
                        {key}
                      </kbd>
                    ))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
