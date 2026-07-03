import { engineBadge, engineColor } from "../databaseInstanceModel";

interface DbEngineIconProps {
  readonly system: string;
  readonly size?: number;
}

// Monogram tile colored by engine brand, mirroring the design's DB badge.
export function DbEngineIcon({ system, size = 30 }: DbEngineIconProps) {
  const color = engineColor(system);
  return (
    <div
      className="grid shrink-0 place-items-center rounded-md font-bold font-mono"
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.37),
        color,
        backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`,
      }}
    >
      {engineBadge(system)}
    </div>
  );
}
