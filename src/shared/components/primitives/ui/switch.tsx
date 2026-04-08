import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

export interface SwitchProps
  extends Omit<React.ComponentPropsWithRef<"button">, "type" | "size" | "onChange"> {
  label?: string;
  size?: "sm" | "md" | "lg";
}

function Switch({
  checked,
  onChange,
  label,
  disabled,
  className,
  size: _size,
  ref,
  ...props
}: SwitchProps & {
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  checked?: boolean;
}) {
  return (
    <label
      className={cn(
        "inline-flex cursor-pointer items-center gap-2",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      <SwitchPrimitive.Root
        ref={ref}
        checked={checked}
        onCheckedChange={(val) => {
          // Synthesize a change event shape for compatibility with existing onChange handlers
          onChange?.({ target: { checked: val } } as React.ChangeEvent<HTMLInputElement>);
        }}
        disabled={disabled}
        className={cn(
          "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          "data-[state=checked]:bg-[var(--color-primary)] data-[state=unchecked]:bg-[var(--bg-hover)]"
        )}
      >
        <SwitchPrimitive.Thumb
          className={cn(
            "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
            "data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0.5"
          )}
        />
      </SwitchPrimitive.Root>
      {label ? <span className="text-[13px] text-[var(--text-secondary)]">{label}</span> : null}
    </label>
  );
}

export { Switch };
