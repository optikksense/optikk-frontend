import { memo } from "react";

interface Segment {
  readonly color: string;
  readonly ratio: number;
  readonly label?: string;
}

interface Props {
  readonly segments: readonly Segment[];
  readonly height?: number;
}

/** Horizontal stacked percentage bar for facet distribution visualization. */
function FacetDistributionBarComponent({ segments, height = 4 }: Props) {
  const total = segments.reduce((s, seg) => s + seg.ratio, 0);
  if (total === 0) return null;

  return (
    <div
      className="flex w-full overflow-hidden rounded-full"
      style={{ height }}
      title={segments
        .map((s) => `${s.label ?? ""}: ${((s.ratio / total) * 100).toFixed(1)}%`)
        .join(" · ")}
    >
      {segments.map((seg, i) => (
        <div
          key={seg.label ?? i}
          className="transition-all duration-200"
          style={{
            width: `${(seg.ratio / total) * 100}%`,
            backgroundColor: seg.color,
            minWidth: seg.ratio > 0 ? 2 : 0,
          }}
        />
      ))}
    </div>
  );
}

export const FacetDistributionBar = memo(FacetDistributionBarComponent);
