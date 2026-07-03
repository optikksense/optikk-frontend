interface TimelineTag {
  color: string;
  label: string;
}

interface TimelineItemData {
  color?: string;
  title?: string;
  timestamp?: string | number;
  description?: string;
  tags?: TimelineTag[];
}
