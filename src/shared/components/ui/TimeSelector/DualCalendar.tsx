import React from 'react';
import { addMonths, subMonths, format } from 'date-fns';
import { TIME_PICKER_TOKENS } from './constants';
import { CalendarMonth } from './CalendarMonth';

interface DualCalendarProps {
  leftMonth: Date;
  setLeftMonth: React.Dispatch<React.SetStateAction<Date>>;
  rangeStart: Date | null;
  rangeEnd: Date | null;
  hoverDate: Date | null;
  selectingMode: boolean;
  onSelectDate: (date: Date) => void;
  onHoverDate: (date: Date | null) => void;
}

export function DualCalendar({
  leftMonth,
  setLeftMonth,
  rangeStart,
  rangeEnd,
  hoverDate,
  selectingMode,
  onSelectDate,
  onHoverDate,
}: DualCalendarProps) {
  const { colors, typography } = TIME_PICKER_TOKENS;
  const rightMonth = addMonths(leftMonth, 1);

  const prevMonth = () => setLeftMonth(subMonths(leftMonth, 1));
  const nextMonth = () => setLeftMonth(addMonths(leftMonth, 1));

  return (
    <div
      style={{
        padding: '8px',
        paddingBottom: '0px', // Empty row removal
        display: 'flex',
        fontFamily: typography.fontFamily,
      }}
    >
      {/* Left Calendar */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '4px',
          }}
        >
          <button
            onClick={prevMonth}
            style={{
              width: '24px',
              height: '24px',
              background: 'transparent',
              border: 'none',
              color: colors.muted,
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ←
          </button>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            {format(leftMonth, 'MMM yyyy')}
          </div>
          <div style={{ width: '24px' }} /> {/* Spacer */}
        </div>
        <CalendarMonth
          currentMonth={leftMonth}
          onSelectDate={onSelectDate}
          onHoverDate={onHoverDate}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          hoverDate={hoverDate}
          selectingMode={selectingMode}
        />
      </div>

      {/* Divider */}
      <div
        style={{
          width: '1px',
          background: colors.border,
          margin: '0 12px',
        }}
      />

      {/* Right Calendar */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '4px',
          }}
        >
          <div style={{ width: '24px' }} /> {/* Spacer */}
          <div
            style={{
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            {format(rightMonth, 'MMM yyyy')}
          </div>
          <button
            onClick={nextMonth}
            style={{
              width: '24px',
              height: '24px',
              background: 'transparent',
              border: 'none',
              color: colors.muted,
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            →
          </button>
        </div>
        <CalendarMonth
          currentMonth={rightMonth}
          onSelectDate={onSelectDate}
          onHoverDate={onHoverDate}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          hoverDate={hoverDate}
          selectingMode={selectingMode}
        />
      </div>
    </div>
  );
}
