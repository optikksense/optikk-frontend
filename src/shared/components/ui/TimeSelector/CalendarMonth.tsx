import React from 'react';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, getDay, isSameMonth, isSameDay, isToday } from 'date-fns';
import { TIME_PICKER_TOKENS, DAYS } from './constants';

interface CalendarMonthProps {
  currentMonth: Date;
  onSelectDate: (date: Date) => void;
  onHoverDate: (date: Date | null) => void;
  rangeStart: Date | null;
  rangeEnd: Date | null;
  hoverDate: Date | null;
  selectingMode: boolean;
}

export function CalendarMonth({
  currentMonth,
  onSelectDate,
  onHoverDate,
  rangeStart,
  rangeEnd,
  hoverDate,
  selectingMode,
}: CalendarMonthProps) {
  const { colors, typography } = TIME_PICKER_TOKENS;

  const start = startOfMonth(currentMonth);
  const end = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start, end });

  // Get start day of week (0 = Sunday, 1 = Monday). Spec uses Monday start.
  // getDay returns 0-6 where 0 is Sunday.
  let startDow = getDay(start);
  startDow = startDow === 0 ? 6 : startDow - 1; // Convert so 0 is Monday

  // Pad the start with nulls to align first day
  const padStartInfo = Array(startDow).fill(null);
  const totalCells = padStartInfo.concat(daysInMonth);

  const isInRange = (date: Date) => {
    if (rangeStart && rangeEnd) {
      return date > rangeStart && date < rangeEnd;
    }
    if (selectingMode && rangeStart && hoverDate) {
      const min = rangeStart < hoverDate ? rangeStart : hoverDate;
      const max = rangeStart > hoverDate ? rangeStart : hoverDate;
      return date > min && date < max;
    }
    return false;
  };

  const isSelectedStart = (date: Date) => {
    return !!rangeStart && isSameDay(date, rangeStart);
  };

  const isSelectedEnd = (date: Date) => {
    return !!rangeEnd && isSameDay(date, rangeEnd);
  };

  return (
    <div style={{ flex: 1, fontFamily: typography.fontFamily }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          columnGap: '2px',
          paddingBottom: '2px',
        }}
      >
        {DAYS.map((d) => (
          <div
            key={d}
            style={{
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.06em',
              color: colors.muted,
              textAlign: 'center',
            }}
          >
            {d}
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          rowGap: '0px',
          columnGap: '2px',
        }}
      >
        {totalCells.map((day, idx) => {
          if (!day) return <div key={idx} />;

          const selectedStart = isSelectedStart(day);
          const selectedEnd = isSelectedEnd(day);
          const selected = selectedStart || selectedEnd;
          const inRange = isInRange(day);
          const today = isToday(day);

          return (
            <button
              key={idx}
              onClick={() => onSelectDate(day)}
              onMouseEnter={() => onHoverDate(day)}
              onMouseLeave={() => onHoverDate(null)}
              style={{
                position: 'relative',
                aspectRatio: '1 / 1', // Square cells
                height: 'auto',
                fontSize: '11px',
                fontWeight: selected ? 700 : 400,
                color: selected ? '#000' : inRange ? colors.cyan : colors.text,
                background: selected
                  ? colors.cyan
                  : inRange
                  ? colors.cyanDim
                  : 'transparent',
                border: 'none',
                borderRadius: selectedStart
                  ? '6px 0 0 6px'
                  : selectedEnd
                  ? '0 6px 6px 0'
                  : inRange
                  ? '0'
                  : '6px',
                cursor: 'pointer',
                fontFamily: typography.fontFamily,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                outline: 'none',
              }}
            >
              <span style={{ zIndex: 1 }}>{format(day, 'd')}</span>
              {today && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '3px',
                    width: '3px',
                    height: '3px',
                    borderRadius: '50%',
                    background: selected ? '#000' : colors.cyan,
                    left: '50%',
                    transform: 'translateX(-50%)',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
