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

                                                                         
const ICONS: Record<string, LucideIcon> = {
  "layout-grid": LayoutGrid,
  tag: Tag,
  activity: Activity,
  server: Server,
  database: Database,
  bell: Bell,
  globe: Globe,
};

export function pageIcon(name: string): LucideIcon {
  return ICONS[name] ?? LayoutGrid;
}
