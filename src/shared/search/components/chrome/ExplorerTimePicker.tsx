import { memo } from "react";

import { TimeRangePicker } from "@shared/components/ui";

/**
 * Thin wrapper around the shared `TimeRangePicker` so explorer pages don't
 * need to know about persistence or comparison-mode plumbing.
 */
function ExplorerTimePickerComponent() {
  return <TimeRangePicker />;
}

export const ExplorerTimePicker = memo(ExplorerTimePickerComponent);
