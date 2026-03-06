import { Col, Row } from 'antd';
import { Activity, Database } from 'lucide-react';

import { formatDuration, formatNumber, normalizePercentage } from '@utils/formatters';

const DB_SYSTEM_META: Record<string, { label: string; color: string; gradient: string }> = {
  postgresql: { label: 'PostgreSQL', color: '#336791', gradient: 'linear-gradient(135deg, #336791 0%, #5E9ED6 100%)' },
  mysql: { label: 'MySQL', color: '#00758F', gradient: 'linear-gradient(135deg, #00758F 0%, #F29111 100%)' },
  redis: { label: 'Redis', color: '#DC382D', gradient: 'linear-gradient(135deg, #DC382D 0%, #FF6B6B 100%)' },
  mongodb: { label: 'MongoDB', color: '#13AA52', gradient: 'linear-gradient(135deg, #13AA52 0%, #6EDB8F 100%)' },
  elasticsearch: { label: 'Elasticsearch', color: '#FEC514', gradient: 'linear-gradient(135deg, #00BFB3 0%, #FEC514 100%)' },
  memcached: { label: 'Memcached', color: '#6DB33F', gradient: 'linear-gradient(135deg, #6DB33F 0%, #98D660 100%)' },
  cassandra: { label: 'Cassandra', color: '#1287B1', gradient: 'linear-gradient(135deg, #1287B1 0%, #66C7E0 100%)' },
  mssql: { label: 'SQL Server', color: '#CC2927', gradient: 'linear-gradient(135deg, #CC2927 0%, #E86B69 100%)' },
  oracle: { label: 'Oracle', color: '#F80000', gradient: 'linear-gradient(135deg, #F80000 0%, #FF6B35 100%)' },
  sqlite: { label: 'SQLite', color: '#0F80CC', gradient: 'linear-gradient(135deg, #0F80CC 0%, #5EB8FF 100%)' },
};

/**
 *
 * @param value
 */
const n = (value: any) => (value == null || Number.isNaN(Number(value)) ? 0 : Number(value));

/**
 *
 * @param system
 */
function getDbMeta(system: string) {
  const key = (system || 'unknown').toLowerCase();
  return DB_SYSTEM_META[key] || {
    label: system || 'Unknown',
    color: '#8e8e8e',
    gradient: 'linear-gradient(135deg, #5E60CE 0%, #48CAE4 100%)',
  };
}

function SystemBreakdownCard({ system }: { system: any }) {
  const meta = getDbMeta(system.db_system);
  const avgLatency = n(system.avg_query_latency_ms);
  const errorRate = system.span_count > 0 ? normalizePercentage((system.error_count / system.span_count) * 100) : 0;

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '14px',
        padding: '18px 20px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'default',
      }}
      className="system-breakdown-card"
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: meta.gradient,
          borderRadius: '14px 14px 0 0',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: `${meta.color}18`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Database size={18} color={meta.color} />
        </div>
        <div>
          <div style={{ color: '#e0e0e0', fontWeight: 600, fontSize: '14px' }}>{meta.label}</div>
          <div style={{ color: '#8e8e8e', fontSize: '11px' }}>{system.db_system}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div>
          <div style={{ color: '#8e8e8e', fontSize: '11px', marginBottom: '2px' }}>Queries</div>
          <div style={{ color: '#e0e0e0', fontWeight: 600, fontSize: '16px', fontFamily: 'monospace' }}>
            {formatNumber(system.query_count)}
          </div>
        </div>
        <div>
          <div style={{ color: '#8e8e8e', fontSize: '11px', marginBottom: '2px' }}>Avg Query / Pool Latency</div>
          <div
            style={{
              color: avgLatency > 100 ? '#F04438' : avgLatency > 50 ? '#F79009' : '#12B76A',
              fontWeight: 600,
              fontSize: '16px',
              fontFamily: 'monospace',
            }}
          >
            {formatDuration(avgLatency)}
          </div>
        </div>
        <div>
          <div style={{ color: '#8e8e8e', fontSize: '11px', marginBottom: '2px' }}>Spans</div>
          <div style={{ color: '#e0e0e0', fontWeight: 600, fontSize: '14px', fontFamily: 'monospace' }}>
            {formatNumber(system.span_count)}
          </div>
        </div>
        <div>
          <div style={{ color: '#8e8e8e', fontSize: '11px', marginBottom: '2px' }}>Error Rate</div>
          <div
            style={{
              color: errorRate > 5 ? '#F04438' : errorRate > 1 ? '#F79009' : '#12B76A',
              fontWeight: 600,
              fontSize: '14px',
              fontFamily: 'monospace',
            }}
          >
            {errorRate.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
}

interface DatabaseSystemBreakdownProps {
  systems: any[];
}

/**
 *
 * @param root0
 * @param root0.systems
 */
export default function DatabaseSystemBreakdown({ systems }: DatabaseSystemBreakdownProps) {
  if (systems.length === 0) {
    return null;
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '14px',
          paddingLeft: '2px',
        }}
      >
        <Activity size={16} color="#8e8e8e" />
        <span
          style={{
            color: '#b0b0b0',
            fontSize: '13px',
            fontWeight: 500,
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
          }}
        >
          Database Systems Detected
        </span>
      </div>
      <Row gutter={[14, 14]}>
        {systems.map((system: any) => (
          <Col key={system.db_system} xs={24} sm={12} lg={8} xl={6}>
            <SystemBreakdownCard system={system} />
          </Col>
        ))}
      </Row>
    </div>
  );
}
