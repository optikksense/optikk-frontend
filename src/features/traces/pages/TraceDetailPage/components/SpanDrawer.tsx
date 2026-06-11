import { SidePanel } from "@shared/components/ui/layout";
import { memo } from "react";

interface Props {
  readonly open: boolean;
  readonly widthPx: number;
  readonly minPx: number;
  readonly maxPx: number;
  readonly onResize: (px: number) => void;
  readonly onClose: () => void;
  readonly children: React.ReactNode;
}

/**
 * Non-modal right drawer for span detail. Refactored to use the shared resizable SidePanel layout primitive.
 */
function SpanDrawerComponent({ open, widthPx, minPx, maxPx, onResize, onClose, children }: Props) {
  return (
    <SidePanel
      open={open}
      onClose={onClose}
      mode="aside"
      width={widthPx}
      resizable
      minWidth={minPx}
      maxWidth={maxPx}
      onResize={onResize}
    >
      {children}
    </SidePanel>
  );
}

export const SpanDrawer = memo(SpanDrawerComponent);
