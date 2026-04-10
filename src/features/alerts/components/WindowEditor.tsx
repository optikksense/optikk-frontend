import { Plus, X } from "lucide-react";

import { Button, IconButton, Input } from "@/components/ui";

import type { AlertWindow } from "../types";

interface WindowEditorProps {
  readonly windows: readonly AlertWindow[];
  readonly onChange: (next: AlertWindow[]) => void;
}

export function WindowEditor({ windows, onChange }: WindowEditorProps) {
  const update = (idx: number, patch: Partial<AlertWindow>) => {
    onChange(windows.map((w, i) => (i === idx ? { ...w, ...patch } : w)));
  };
  const remove = (idx: number) => {
    onChange(windows.filter((_, i) => i !== idx));
  };
  const add = () => {
    onChange([...windows, { name: `window_${windows.length + 1}`, secs: 300 }]);
  };
  return (
    <div className="flex flex-col gap-2">
      {windows.map((w, idx) => (
        <div key={`${w.name}-${idx}`} className="flex items-center gap-2">
          <Input
            value={w.name}
            onChange={(e) => update(idx, { name: e.target.value })}
            placeholder="Name (short/long)"
            className="w-32"
          />
          <Input
            type="number"
            value={String(w.secs)}
            onChange={(e) => update(idx, { secs: Number(e.target.value) || 0 })}
            placeholder="Seconds"
            className="w-28"
          />
          <span className="text-[11px] text-[var(--text-muted)]">
            {formatSecs(w.secs)}
          </span>
          <IconButton
            icon={<X size={12} />}
            size="sm"
            variant="ghost"
            label="Remove window"
            onClick={() => remove(idx)}
          />
        </div>
      ))}
      <Button variant="ghost" size="sm" onClick={add}>
        <Plus size={12} /> Add window
      </Button>
    </div>
  );
}

function formatSecs(secs: number): string {
  if (secs >= 86_400) return `${Math.round(secs / 86_400)}d`;
  if (secs >= 3_600) return `${Math.round(secs / 3_600)}h`;
  if (secs >= 60) return `${Math.round(secs / 60)}m`;
  return `${secs}s`;
}
