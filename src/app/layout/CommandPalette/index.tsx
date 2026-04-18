import { useNavigate } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { dynamicNavigateOptions } from "@/shared/utils/navigation";

import type { PaletteAction, PaletteActionContext } from "./types";

function ActionHotkey({ action }: { action: PaletteAction }) {
  const navigate = useNavigate();
  const context: PaletteActionContext = {
    navigate: (path: string) => navigate(dynamicNavigateOptions(path)),
  };

  useHotkeys(action.hotkey!, (e) => {
    e.preventDefault();
    if (action.enabled && !action.enabled()) {
      return;
    }
    action.perform(context);
  });
  return null;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [allActions, setAllActions] = useState<PaletteAction[]>([]);
  const navigate = useNavigate();
  const actionContext: PaletteActionContext = {
    navigate: (path: string) => navigate(dynamicNavigateOptions(path)),
  };

  // Toggle palette with Cmd+K or Ctrl+K
  useHotkeys("meta+k, ctrl+k", (e) => {
    e.preventDefault();
    setOpen((o) => !o);
  });

  useEffect(() => {
    const load = () => {
      void import("./registry").then((m) => setAllActions(m.allActions));
    };
    const idle = (window as unknown as { requestIdleCallback?: (cb: () => void) => number })
      .requestIdleCallback;
    if (idle) idle(load);
    else window.setTimeout(load, 0);
  }, []);

  const handleSelect = (action: PaletteAction) => {
    action.perform(actionContext);
    setOpen(false);
  };

  const navActions = allActions.filter(
    (a) => a.group === "navigation" && (!a.enabled || a.enabled())
  );

  const featureActions = allActions.filter(
    (a) => a.group === "feature" && (!a.enabled || a.enabled())
  );
  const appActions = allActions.filter(
    (a) => a.group === "settings" && (!a.enabled || a.enabled())
  );

  return (
    <>
      {allActions
        .filter((a) => a.hotkey)
        .map((a) => (
          <ActionHotkey key={a.id} action={a} />
        ))}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[20vh] backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="fade-in zoom-in-95 relative w-full max-w-lg animate-in shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Command className="rounded-xl border border-border shadow-md">
              <CommandInput placeholder="Type a command or search..." />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>

                {navActions.length > 0 && (
                  <CommandGroup heading="Navigation">
                    {navActions.map((action) => (
                      <CommandItem
                        key={action.id}
                        onSelect={() => handleSelect(action)}
                        keywords={action.keywords}
                      >
                        {action.icon}
                        <span style={{ marginLeft: action.icon ? 8 : 0 }}>{action.label}</span>
                        {action.hotkey && (
                          <span style={{ marginLeft: "auto", fontSize: "0.75rem", opacity: 0.5 }}>
                            {action.hotkey.toUpperCase()}
                          </span>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {featureActions.length > 0 && (
                  <CommandGroup heading="Feature Actions">
                    {featureActions.map((action) => (
                      <CommandItem
                        key={action.id}
                        onSelect={() => handleSelect(action)}
                        keywords={action.keywords}
                      >
                        {action.icon}
                        <span style={{ marginLeft: action.icon ? 8 : 0 }}>{action.label}</span>
                        {action.hotkey && (
                          <span style={{ marginLeft: "auto", fontSize: "0.75rem", opacity: 0.5 }}>
                            {action.hotkey.toUpperCase()}
                          </span>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {appActions.length > 0 && (
                  <CommandGroup heading="App Actions">
                    {appActions.map((action) => (
                      <CommandItem
                        key={action.id}
                        onSelect={() => handleSelect(action)}
                        keywords={action.keywords}
                      >
                        {action.icon}
                        <span style={{ marginLeft: action.icon ? 8 : 0 }}>{action.label}</span>
                        {action.hotkey && (
                          <span style={{ marginLeft: "auto", fontSize: "0.75rem", opacity: 0.5 }}>
                            {action.hotkey.toUpperCase()}
                          </span>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </div>
        </div>
      )}
    </>
  );
}
