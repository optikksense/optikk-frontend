import React from 'react';
import { TIME_PICKER_TOKENS } from './constants';

interface TimeFooterProps {
  fromStr: string;
  toStr: string;
  editingField: 'from' | 'to';
  setFromStr: (val: string) => void;
  setToStr: (val: string) => void;
  setEditingField: (val: 'from' | 'to') => void;
  onApply: () => void;
  onCancel: () => void;
}

export function TimeFooter({
  fromStr,
  toStr,
  editingField,
  setFromStr,
  setToStr,
  setEditingField,
  onApply,
  onCancel,
}: TimeFooterProps) {
  const { colors, typography } = TIME_PICKER_TOKENS;

  return (
    <div
      style={{
        background: '#0A0F16',
        padding: '8px 12px',
        borderTop: `1px solid ${colors.border}`,
        display: 'flex',
        alignItems: 'flex-end',
        gap: '8px',
        fontFamily: typography.fontFamily,
      }}
    >
      {/* Time inputs (FROM and TO) */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <label
            style={{
              fontSize: '9px',
              color: colors.muted,
              textTransform: 'uppercase',
              letterSpacing: '0.10em',
              fontWeight: 600,
            }}
          >
            FROM
          </label>
          <input
            value={fromStr}
            onChange={(e) => setFromStr(e.target.value)}
            onFocus={() => setEditingField('from')}
            style={{
              height: '32px',
              padding: '6px 10px',
              borderRadius: '6px',
              background: colors.panel2,
              border: `1px solid ${editingField === 'from' ? colors.cyan : colors.border}`,
              color: colors.cyan,
              fontSize: '12px',
              fontFamily: typography.fontFamily,
              letterSpacing: '0.05em',
              boxShadow: editingField === 'from' ? `0 0 0 2px rgba(0,217,255,0.15)` : 'none',
              outline: 'none',
              width: '130px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Arrow separator */}
        <div
          style={{
            fontSize: '14px',
            color: colors.muted,
            paddingBottom: '6px',
          }}
        >
          →
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <label
            style={{
              fontSize: '9px',
              color: colors.muted,
              textTransform: 'uppercase',
              letterSpacing: '0.10em',
              fontWeight: 600,
            }}
          >
            TO
          </label>
          <input
            value={toStr}
            onChange={(e) => setToStr(e.target.value)}
            onFocus={() => setEditingField('to')}
            style={{
              height: '32px',
              padding: '6px 10px',
              borderRadius: '6px',
              background: colors.panel2,
              border: `1px solid ${editingField === 'to' ? colors.cyan : colors.border}`,
              color: colors.cyan,
              fontSize: '12px',
              fontFamily: typography.fontFamily,
              letterSpacing: '0.05em',
              boxShadow: editingField === 'to' ? `0 0 0 2px rgba(0,217,255,0.15)` : 'none',
              outline: 'none',
              width: '130px',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Vertical divider */}
      <div
        style={{
          width: '1px',
          height: '32px',
          background: colors.border,
          margin: '0 4px',
        }}
      />

      <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto' }}>
        <button
          onClick={onCancel}
          style={{
            width: '72px',
            height: '36px',
            borderRadius: '8px',
            background: 'transparent',
            border: `1px solid ${colors.border}`,
            color: colors.muted,
            fontSize: '12px',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            fontFamily: typography.fontFamily,
            fontWeight: 400,
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          Cancel
        </button>

        <button
          onClick={onApply}
          style={{
            width: '96px',
            height: '36px',
            borderRadius: '8px',
            background: colors.cyan,
            color: colors.blackBtn,
            fontWeight: 700,
            fontSize: '12px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontFamily: typography.fontFamily,
            boxShadow: `0 4px 20px ${colors.cyanGlow}`,
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          Apply
        </button>
      </div>
    </div>
  );
}
