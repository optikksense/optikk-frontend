import * as Popover from "@radix-ui/react-popover";
import { GripVertical } from "lucide-react";
import { memo, useCallback, useState } from "react";

import type { ColumnConfig, ColumnDef } from "../../types/results";

interface Props<Row> {
  readonly columns: readonly ColumnDef<Row>[];
  readonly config: readonly ColumnConfig[];
  readonly onChange: (next: readonly ColumnConfig[]) => void;
  readonly trigger: React.ReactNode;
}

function toggleVisible(
  config: readonly ColumnConfig[],
  key: string
): readonly ColumnConfig[] {
  return config.map((entry) => (entry.key === key ? { ...entry, visible: !entry.visible } : entry));
}

function moveItem<T>(list: readonly T[], from: number, to: number): T[] {
  if (from === to) return [...list];
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function ResultsColumnPickerImpl<Row>({ columns, config, onChange, trigger }: Props<Row>) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const columnByKey = new Map(columns.map((column) => [column.key, column]));
  const onToggle = useCallback(
    (key: string) => onChange(toggleVisible(config, key)),
    [config, onChange]
  );
  const onDrop = useCallback(
    (to: number) => {
      if (dragIndex === null) return;
      onChange(moveItem(config, dragIndex, to));
      setDragIndex(null);
    },
    [config, dragIndex, onChange]
  );
  return (
    <Popover.Root>
      <Popover.Trigger asChild>{trigger}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={6}
          className="z-50 flex w-64 flex-col gap-1 rounded-md border border-[var(--border-color)] bg-[var(--bg-primary)] p-2 shadow-lg"
        >
          <span className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Columns
          </span>
          {config.map((entry, index) => {
            const column = columnByKey.get(entry.key);
            return (
              <label
                key={entry.key}
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => onDrop(index)}
                className="flex items-center gap-2 rounded px-2 py-1 hover:bg-[rgba(255,255,255,0.04)]"
              >
                <GripVertical size={12} className="cursor-grab text-[var(--text-muted)]" />
                <input
                  type="checkbox"
                  checked={entry.visible}
                  onChange={() => onToggle(entry.key)}
                  className="accent-[var(--accent)]"
                />
                <span className="text-[12px] text-[var(--text-primary)]">
                  {column?.label ?? entry.key}
                </span>
              </label>
            );
          })}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

export const ResultsColumnPicker = memo(ResultsColumnPickerImpl) as <Row>(
  props: Props<Row>
) => JSX.Element;
