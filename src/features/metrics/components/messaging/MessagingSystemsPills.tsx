import { Activity, Radio } from 'lucide-react';

import { getMqMeta } from './messagingMeta';

interface MessagingSystemsPillsProps {
  systems: string[];
}

/**
 *
 * @param root0
 * @param root0.systems
 */
export default function MessagingSystemsPills({ systems }: MessagingSystemsPillsProps) {
  if (systems.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '16px',
        flexWrap: 'wrap',
      }}
    >
      <Activity size={14} color="#8e8e8e" />
      <span style={{ color: '#8e8e8e', fontSize: '12px', fontWeight: 500 }}>Systems:</span>
      {systems.map((system) => {
        const meta = getMqMeta(system);
        return (
          <span
            key={system}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 10px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: 600,
              color: meta.badgeColor,
              background: `${meta.badgeColor}12`,
              border: `1px solid ${meta.badgeColor}28`,
            }}
          >
            <Radio size={10} />
            {meta.label}
          </span>
        );
      })}
    </div>
  );
}
