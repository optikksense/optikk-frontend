import {
  useCallback,
  useEffect,
  useState,
  type Dispatch,
  type MouseEvent as ReactMouseEvent,
  type SetStateAction,
} from 'react';

export type ColumnWidthMap = Record<string, number>;

interface UseResizableColumnsOptions {
  initialWidths: ColumnWidthMap;
  defaultWidth?: number;
  minWidth?: number;
}

interface UseResizableColumnsResult {
  columnWidths: ColumnWidthMap;
  setColumnWidths: Dispatch<SetStateAction<ColumnWidthMap>>;
  handleResizeMouseDown: (
    event: ReactMouseEvent<HTMLDivElement>,
    columnKey: string,
  ) => void;
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

      const onMove = (moveEvent: MouseEvent): void => {
        const widthDelta = moveEvent.clientX - startX;
        setColumnWidths((previous) => ({
          ...previous,
          [columnKey]: Math.max(minWidth, startWidth + widthDelta),
        }));
      };

      const onUp = (): void => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    },
    [columnWidths, defaultWidth, minWidth],
  );

  return {
    columnWidths,
    setColumnWidths,
    handleResizeMouseDown,
  };
}
