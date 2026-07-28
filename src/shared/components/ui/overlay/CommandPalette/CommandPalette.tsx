import { useNavigate } from "@tanstack/react-router";
import { Command } from "cmdk";
import {
  Activity,
  AlertCircle,
  Box,
  Cpu,
  FileText,
  Home,
  LayoutDashboard,
  Search,
  Settings,
} from "lucide-react";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { ROUTES } from "@/shared/constants/routes";
import { cn } from "@shared/lib/utils";

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

                                       
  useHotkeys(
    "meta+k, ctrl+k",
    (e) => {
      e.preventDefault();
      setOpen((open) => !open);
    },
    { enableOnFormTags: true }
  );

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Global Command Menu"
      className={cn(
        "-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 z-[100] w-full max-w-[640px]",
        "overflow-hidden rounded-xl border border-border bg-card shadow-2xl",
        "data-[state=closed]:fade-out data-[state=open]:fade-in data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 transition-all duration-200 ease-in-out data-[state=closed]:animate-out data-[state=open]:animate-in"
      )}
      overlayClassName="fixed inset-0 z-[99] bg-background/80 backdrop-blur-sm data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out data-[state=open]:fade-in"
    >
      <div className="flex items-center border-border border-b px-4" cmdk-input-wrapper="">
        <Search className="mr-2 h-4 w-4 shrink-0 text-foreground-muted" />
        <Command.Input
          placeholder="Type a command or search..."
          className="flex h-11 w-full rounded-md bg-transparent py-3 text-foreground text-sm outline-none placeholder:text-foreground-muted disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
      <Command.List className="max-h-[400px] overflow-y-auto overflow-x-hidden p-2">
        <Command.Empty className="py-6 text-center text-foreground-muted text-sm">
          No results found.
        </Command.Empty>
        <Command.Group
          heading="Navigation"
          className="overflow-hidden text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-foreground-muted [&_[cmdk-group-heading]]:text-xs"
        >
          <Command.Item
            onSelect={() => runCommand(() => navigate({ to: ROUTES.home }))}
            className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-foreground text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
          >
            <Home className="mr-2 h-4 w-4" />
            Home
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => navigate({ to: ROUTES.services }))}
            className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-foreground text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
          >
            <Box className="mr-2 h-4 w-4" />
            Services
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => navigate({ to: ROUTES.traces }))}
            className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-foreground text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
          >
            <Activity className="mr-2 h-4 w-4" />
            Traces
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => navigate({ to: ROUTES.logs }))}
            className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-foreground text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
          >
            <FileText className="mr-2 h-4 w-4" />
            Logs
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => navigate({ to: ROUTES.errors }))}
            className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-foreground text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
          >
            <AlertCircle className="mr-2 h-4 w-4" />
            Errors
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => navigate({ to: ROUTES.infrastructure }))}
            className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-foreground text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
          >
            <Cpu className="mr-2 h-4 w-4" />
            Infrastructure
          </Command.Item>
        </Command.Group>

        <Command.Separator className="-mx-1 my-1 h-px bg-border" />

        <Command.Group
          heading="Tools"
          className="overflow-hidden text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-foreground-muted [&_[cmdk-group-heading]]:text-xs"
        >
          <Command.Item
            onSelect={() => runCommand(() => navigate({ to: ROUTES.dashboards }))}
            className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-foreground text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboards
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => navigate({ to: ROUTES.monitors }))}
            className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-foreground text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
          >
            <Activity className="mr-2 h-4 w-4" />
            Monitors
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => navigate({ to: ROUTES.settings }))}
            className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-foreground text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Command.Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
}
