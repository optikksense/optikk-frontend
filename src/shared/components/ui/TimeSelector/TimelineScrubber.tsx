import React from 'react';
import { TIME_PICKER_TOKENS } from './constants';

interface TimelineScrubberProps {
  fromTime: number; // unix timestamp
  toTime: number; // unix timestamp
}

export function TimelineScrubber({ fromTime, toTime }: TimelineScrubberProps) {
  const { colors, typography } = TIME_PICKER_TOKENS;

  const now = Date.now();
  const windowMs = 90 * 24 * 60 * 60 * 1000; // 90 days in ms
  const windowStart = now - windowMs;

  // Calculate percentages (0 to 100)
  // Clamp values to ensure they stay within the track
  const startPercent = Math.max(0, Math.min(100, ((fromTime - windowStart) / windowMs) * 100));
  const endPercent = Math.max(0, Math.min(100, ((toTime - windowStart) / windowMs) * 100));

  const width = Math.max(0, endPercent - startPercent);

  return (
    <div
      style={{
        padding: '4px 8px',
        margin: 0,
        fontFamily: typography.fontFamily,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '4px',
          marginBottom: '4px',
          fontSize: '9px',
          color: colors.muted,
          textTransform: 'uppercase',
          fontWeight: 600,
          letterSpacing: '0.10em',
        }}
      >
        <span>90d ago</span>
        <span>now</span>
      </div>

      <div
        style={{
          position: 'relative',
          height: '6px',
          background: colors.panel2,
          borderRadius: '3px',
          width: '100%',
        }}
      >
        {/* Fill */}
        {width > 0 && (
          <div
            style={{
              position: 'absolute',
              left: `${startPercent}%`,
              width: `${width}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${colors.cyan} 0%, ${colors.cyan} 100%)`, // fallback
              backgroundImage: `linear-gradient(to right, ${colors.cyan}88, ${colors.cyan})`,
              borderRadius: '3px',
              boxShadow: `0 0 8px rgba(0,217,255,0.4)`,
              pointerEvents: 'none',
            }}
          />
        )}
      </div>
    </div>
  );
}
