import {
  Activity,
  Bell,
  Database,
  Globe,
  LayoutGrid,
  type LucideIcon,
  Server,
  Tag,
} from "lucide-react";

// Maps a stored page icon name to a lucide icon; defaults to LayoutGrid.
const ICONS: Record<string, LucideIcon> = {
  "layout-grid": LayoutGrid,
  tag: Tag,
  activity: Activity,
  server: Server,
  database: Database,
  bell: Bell,
  globe: Globe,
};

export const PAGE_ICON_CHOICES = Object.keys(ICONS);

export function pageIcon(name: string): LucideIcon {
  return ICONS[name] ?? LayoutGrid;
}
