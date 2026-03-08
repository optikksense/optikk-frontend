import React from 'react';
import { TIME_PICKER_TOKENS, RANGE_GROUPS } from './constants';

interface PresetSidebarProps {
  activePreset: string;
  onSelectPreset: (preset: { label: string; value: string; minutes: number }) => void;
  onSnapToNow: () => void;
}

export function PresetSidebar({
  activePreset,
  onSelectPreset,
  onSnapToNow,
}: PresetSidebarProps) {
  const { colors, typography } = TIME_PICKER_TOKENS;

  return (
    <div
      style={{
        width: '140px',
        minWidth: '140px',
        padding: '6px 0',
        borderRight: `1px solid ${colors.border}`,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: typography.fontFamily,
      }}
    >
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {RANGE_GROUPS.map((group, groupIdx) => (
          <div
            key={group.title}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2px', // Explicit 2px 
              marginTop: '0', // Removed mt
            }}
          >
            {/* Group Label */}
            <div
              style={{
                fontSize: '9px',
                fontWeight: 600,
                color: colors.muted,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                padding: '4px 16px 0px',
                marginBottom: '0px', // Removed mb
              }}
            >
              {group.title}
            </div>

            {/* Presets List */}
            {group.items.map((item) => {
              const isActive = activePreset === item.value;
              return (
                <button
                  key={item.value}
                  onClick={() => onSelectPreset(item)}
                  style={{
                    padding: '3px 16px',
                    textAlign: 'left',
                    background: isActive ? colors.cyanDim : 'transparent',
                    color: isActive ? colors.cyan : '#8899AA',
                    fontSize: '12px',
                    fontWeight: isActive ? 600 : 400,
                    letterSpacing: '0.04em',
                    lineHeight: '1.2',
                    border: 'none',
                    borderLeft: `2px solid ${isActive ? colors.cyan : 'transparent'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    fontFamily: typography.fontFamily,
                    outline: 'none',
                    transition: 'background 0.1s, color 0.1s, border-left-color 0.1s',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = colors.cyan;
                      e.currentTarget.style.background = colors.cyanDim;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#8899AA';
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Snap to Now button */}
      <div style={{ padding: '0 16px', marginTop: '4px' }}>
        <button
          onClick={onSnapToNow}
          style={{
            height: '24px',
            width: '100%',
            background: colors.cyanDim,
            border: `1px solid rgba(0,217,255,0.2)`,
            borderRadius: '6px',
            color: colors.cyan,
            fontSize: '12px',
            fontWeight: 500,
            cursor: 'pointer',
            fontFamily: typography.fontFamily,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.cyanMid;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = colors.cyanDim;
          }}
        >
          → Now
        </button>
      </div>
    </div>
  );
}
