import {
  type Dispatch,
  type MouseEvent as ReactMouseEvent,
  type SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";

/**
 *
 */
export type ColumnWidthMap = Record<string, number>;

interface UseResizableColumnsOptions {
  initialWidths: ColumnWidthMap;
  defaultWidth?: number;
  minWidth?: number;
}

interface UseResizableColumnsResult {
  columnWidths: ColumnWidthMap;
  setColumnWidths: Dispatch<SetStateAction<ColumnWidthMap>>;
  handleResizeMouseDown: (event: ReactMouseEvent<HTMLDivElement>, columnKey: string) => void;
}

/**
 * Handles mutable column width state and drag-to-resize behavior.
 * @param options Hook options.
 */
export function useResizableColumns({
  initialWidths,
  defaultWidth = 160,
  minWidth = 60,
}: UseResizableColumnsOptions): UseResizableColumnsResult {
  const [columnWidths, setColumnWidths] = useState<ColumnWidthMap>(initialWidths);

  useEffect(() => {
    setColumnWidths(initialWidths);
  }, [initialWidths]);

  const handleResizeMouseDown = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>, columnKey: string): void => {
      event.preventDefault();

      const startX = event.clientX;
      const startWidth = columnWidths[columnKey] ?? defaultWidth;
      let nextWidth = startWidth;
      let rafId: number | null = null;

      const flush = () => {
        rafId = null;
        setColumnWidths((previous) =>
          previous[columnKey] === nextWidth ? previous : { ...previous, [columnKey]: nextWidth }
        );
      };

      const onMove = (moveEvent: MouseEvent): void => {
        const widthDelta = moveEvent.clientX - startX;
        nextWidth = Math.max(minWidth, startWidth + widthDelta);
        if (rafId == null) rafId = window.requestAnimationFrame(flush);
      };

      const onUp = (): void => {
        if (rafId != null) {
          window.cancelAnimationFrame(rafId);
          flush();
        }
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [columnWidths, defaultWidth, minWidth]
  );

  return {
    columnWidths,
    setColumnWidths,
    handleResizeMouseDown,
  };
}
