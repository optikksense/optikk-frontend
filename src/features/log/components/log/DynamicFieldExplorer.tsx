import React, { useMemo } from 'react';
import type { LogRecord } from '../../types';

export interface DynamicFieldExplorerProps {
  logs: LogRecord[];
  onSelectField: (key: string, value: string) => void;
  isLoading?: boolean;
}

export default function DynamicFieldExplorer({ logs, onSelectField, isLoading }: DynamicFieldExplorerProps) {
  // Extract top attributes from the current log batch
  const attributes = useMemo(() => {
    if (!logs || logs.length === 0) return [];

    const fieldCounts: Record<string, { count: number; sampleValue: string }> = {};

    logs.slice(0, 100).forEach(log => {
      // Look at string attributes
      const strAttrs = (log as any).attributes_string || {};
      Object.keys(strAttrs).forEach(k => {
        if (!fieldCounts[k]) fieldCounts[k] = { count: 0, sampleValue: String(strAttrs[k]) };
        fieldCounts[k].count++;
      });
      // Look at number attributes
      const numAttrs = (log as any).attributes_number || {};
      Object.keys(numAttrs).forEach(k => {
        if (!fieldCounts[k]) fieldCounts[k] = { count: 0, sampleValue: String(numAttrs[k]) };
        fieldCounts[k].count++;
      });
    });

    const sortedFields = Object.entries(fieldCounts)
      .filter(([k]) => !['http.route', 'http.method', 'span_id'].includes(k)) // hide some high cardinality or boring stuff if needed
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 20); // Top 20 dynamic fields in view

    return sortedFields;
  }, [logs]);

  return (
    <div style={{
      width: 240,
      flexShrink: 0,
      background: 'var(--glass-bg)',
      backdropFilter: 'var(--glass-blur)',
      borderRight: '1px solid var(--glass-border)',
      display: 'flex',
      flexDirection: 'column',
      padding: '16px 0',
      overflowY: 'auto',
    }}>
      <div style={{ padding: '0 16px', marginBottom: 12, fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        Discovered Fields
      </div>
      
      {isLoading ? (
        <div style={{ padding: '16px', color: 'var(--text-muted)', fontSize: 12 }}>Loading fields...</div>
      ) : attributes.length === 0 ? (
        <div style={{ padding: '16px', color: 'var(--text-muted)', fontSize: 12 }}>No dynamic attributes found in this view.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {attributes.map(([key, data]) => (
            <div
              key={key}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 16px',
                cursor: 'pointer',
                transition: 'background 0.1s',
                fontSize: 12,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--literal-rgba-255-255-255-0p05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
              onClick={() => onSelectField(key, data.sampleValue)}
            >
              <div style={{ color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80%' }}>
                attr.{key}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: 10 }}>
                {data.count}
              </div>
            </div>
          ))}
        </div>
      )}
      <div style={{ padding: '16px', marginTop: 'auto', color: 'var(--text-disabled)', fontSize: 11, fontStyle: 'italic', lineHeight: 1.4 }}>
        Click a field to add it to your query. Data is sampled from the active view.
      </div>
    </div>
  );
}
