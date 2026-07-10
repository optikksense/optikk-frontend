interface ContextMenuAction {
  readonly kind: "action";
  readonly label: string;
  readonly icon?: React.ReactNode;
  readonly onSelect: () => void;
  readonly disabled?: boolean;
  readonly destructive?: boolean;
}

interface ContextMenuSeparator {
  readonly kind: "separator";
}

export type ContextMenuEntry = ContextMenuAction | ContextMenuSeparator;
