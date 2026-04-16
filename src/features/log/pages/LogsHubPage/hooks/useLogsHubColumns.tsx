import { useMemo } from "react";

import type { LogRecord } from "../../../types";
import { buildLogTableColumns } from "../logColumnDefs";

export function useLogsHubColumns(
  liveTailEnabled: boolean,
  onSelectMessage: (row: LogRecord) => void
) {
  return useMemo(
    () => buildLogTableColumns(liveTailEnabled, onSelectMessage),
    [liveTailEnabled, onSelectMessage]
  );
}
