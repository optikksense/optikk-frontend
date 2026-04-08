import { formatRelativeTime } from "@shared/utils/formatters";

import { APP_COLORS } from "@config/colorLiterals";

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

interface TimelineProps {
  items?: TimelineItemData[];
}

/**
 * Renders timeline entries with optional tags and relative timestamps.
 * @param props Component props.
 * @returns Timeline component or null when empty.
 */
export default function Timeline({ items = [] }: TimelineProps): JSX.Element | null {
  if (items.length === 0) return null;

  return (
    <div className="py-2">
      <div className="relative flex flex-col pl-5">
        {items.map((item, index) => (
          <div key={index} className="relative pb-6">
            {/* Dot */}
            <div
              className="-left-5 absolute top-1 z-[1] h-2.5 w-2.5 rounded-full"
              style={{ background: item.color || `var(--color-primary, ${APP_COLORS.hex_5e60ce})` }}
            />
            {/* Line */}
            {index < items.length - 1 && (
              <div
                className="-left-4 absolute top-3.5 w-0.5 bg-border"
                style={{ height: "calc(100% - 10px)" }}
              />
            )}
            {/* Content */}
            <div className="pb-1">
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold text-[13px] text-foreground">{item.title}</span>
                <span className="whitespace-nowrap text-muted-foreground text-xs">
                  {item.timestamp ? formatRelativeTime(item.timestamp) : ""}
                </span>
              </div>
              {item.description && (
                <div className="mt-1 text-[color:var(--text-secondary)] text-xs leading-[1.5]">
                  {item.description}
                </div>
              )}
              {item.tags && (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {item.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="rounded border px-2 py-px text-[11px]"
                      style={{ borderColor: tag.color, color: tag.color }}
                    >
                      {tag.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
