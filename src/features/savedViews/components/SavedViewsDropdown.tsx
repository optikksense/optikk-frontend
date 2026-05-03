import { Bookmark, Save, Trash2 } from "lucide-react";
import { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useSavedViews } from "../hooks/useSavedViews";

interface Props {
  readonly scope: string;
  readonly onLoad: (url: string) => void;
}

function SaveCurrentRow({ onSave }: { onSave: (name: string) => void }) {
  const [name, setName] = useState("");
  return (
    <div className="flex items-center gap-2 px-2 py-1.5">
      <input
        value={name}
        onChange={(ev) => setName(ev.target.value)}
        placeholder="View name…"
        className="flex-1 rounded border border-[var(--border-color)] bg-transparent px-2 py-1 text-[12px] text-[var(--text-primary)] focus:outline-none"
      />
      <button
        type="button"
        disabled={!name.trim()}
        onClick={() => {
          if (!name.trim()) return;
          onSave(name.trim());
          setName("");
        }}
        className="flex items-center gap-1 rounded bg-[var(--bg-hover)] px-2 py-1 text-[11px] text-[var(--text-primary)] hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Save size={12} />
        Save
      </button>
    </div>
  );
}

export function SavedViewsDropdown({ scope, onLoad }: Props) {
  const { views, create, remove } = useSavedViews(scope);
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu
      open={open}
      onOpenChange={setOpen}
      className="min-w-[280px]"
      trigger={
        <button
          type="button"
          className="flex items-center gap-1 rounded-md border border-[var(--border-color)] bg-[var(--bg-elevated)] px-2 py-1 text-[12px] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
        >
          <Bookmark size={12} />
          Views
          {views.length > 0 ? (
            <span className="ml-1 text-[11px] text-[var(--text-muted)]">{views.length}</span>
          ) : null}
        </button>
      }
    >
        <DropdownMenuLabel>Save current view</DropdownMenuLabel>
        <SaveCurrentRow
          onSave={(name) =>
            create({
              name,
              url: window.location.pathname + window.location.search,
              visibility: "private",
            })
          }
        />
        <DropdownMenuSeparator />
        {views.length === 0 ? (
          <DropdownMenuItem disabled>No saved views yet</DropdownMenuItem>
        ) : (
          views.map((v) => (
            <DropdownMenuItem
              key={v.id}
              className="flex items-center justify-between gap-2"
              onSelect={() => onLoad(v.url)}
            >
              <span className="truncate">{v.name}</span>
              <button
                type="button"
                onClick={(ev) => {
                  ev.stopPropagation();
                  remove(v.id);
                }}
                className="text-[var(--text-muted)] hover:text-red-400"
                aria-label={`Delete ${v.name}`}
              >
                <Trash2 size={12} />
              </button>
            </DropdownMenuItem>
          ))
        )}
    </DropdownMenu>
  );
}
