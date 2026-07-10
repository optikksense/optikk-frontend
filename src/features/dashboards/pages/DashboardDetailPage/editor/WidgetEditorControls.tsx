import { MetricSegmentedControl } from "@shared/metrics/components/MetricSegmentedControl";

import type { WidgetDisplayOptions, WidgetSize } from "../../../builder/metricsWidget";

const SIZE_OPTIONS: ReadonlyArray<{ readonly value: WidgetSize; readonly label: string }> = [
  { value: "sm", label: "S" },
  { value: "md", label: "M" },
  { value: "lg", label: "L" },
  { value: "full", label: "Full" },
];

interface WidgetEditorControlsProps {
  readonly display: WidgetDisplayOptions;
  readonly onDisplayChange: (patch: Partial<WidgetDisplayOptions>) => void;
  readonly size: WidgetSize;
  readonly onSizeChange: (size: WidgetSize) => void;
}

/** Per-widget display toggles and grid-size selector. */
export function WidgetEditorControls({
  display,
  onDisplayChange,
  size,
  onSizeChange,
}: WidgetEditorControlsProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <Toggle
          label="Legend"
          checked={display.legend}
          onChange={(v) => onDisplayChange({ legend: v })}
        />
        <Toggle
          label="Smoothing"
          checked={display.smooth}
          onChange={(v) => onDisplayChange({ smooth: v })}
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-foreground-muted">Size</span>
        <MetricSegmentedControl
          options={SIZE_OPTIONS}
          value={size}
          onChange={onSizeChange}
          size="sm"
        />
      </div>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  readonly label: string;
  readonly checked: boolean;
  readonly onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-[12px] text-foreground-secondary">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-3.5 w-3.5 accent-[var(--color-primary)]"
      />
      {label}
    </label>
  );
}
