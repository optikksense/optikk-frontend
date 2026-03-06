import { Card, Col, Progress, Row, Skeleton, Tag } from 'antd';
import { ShieldCheck } from 'lucide-react';

interface SloHealthGaugesProps {
  isLoading: boolean;
  availabilityPct: number;
  p95Ms: number;
  errorBudget: number;
  isCompliant: boolean;
  compliancePct: string;
  timeseriesLength: number;
  breachedCount: number;
  totalRequests: number;
  averageLatencyMs: number;
  availabilityTarget: number;
  p95TargetMs: number;
}

/**
 *
 * @param value
 */
const n = (value: any) => (value == null || Number.isNaN(Number(value)) ? 0 : Number(value));

interface SloGaugeProps {
  title: string;
  value: number;
  target: number;
  unit?: '%' | 'ms';
  description?: string;
}

/**
 *
 * @param root0
 * @param root0.title
 * @param root0.value
 * @param root0.target
 * @param root0.unit
 * @param root0.description
 */
function SloGauge({
  title,
  value,
  target,
  unit = '%',
  description,
}: SloGaugeProps) {
  const percent = unit === 'ms'
    ? Math.min(100, (target / Math.max(value, 0.001)) * 100)
    : Math.min(100, value);
  const good = unit === 'ms' ? value <= target : value >= target;
  const strokeColor = good ? '#12B76A' : percent >= 80 ? '#F79009' : '#F04438';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        padding: '20px 24px',
        background: 'var(--bg-tertiary, #1A1A1A)',
        borderRadius: 8,
        border: '1px solid var(--border-color, #2D2D2D)',
        minWidth: 160,
        flex: 1,
      }}
    >
      <Progress
        type="dashboard"
        percent={Number(percent.toFixed(1))}
        size={100}
        strokeColor={strokeColor}
        trailColor="#2D2D2D"
        format={() => (
          <div style={{ textAlign: 'center', lineHeight: 1.2 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: strokeColor }}>
              {unit === 'ms' ? `${n(value).toFixed(0)}ms` : `${n(value).toFixed(2)}%`}
            </div>
          </div>
        )}
      />
      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', textAlign: 'center' }}>
        {title}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
        Target: {unit === 'ms' ? `<${target}ms` : `≥${target}%`}
      </div>
      <Tag
        style={{
          fontSize: 11,
          borderRadius: 12,
          background: good ? 'rgba(18,183,106,0.12)' : 'rgba(240,68,56,0.12)',
          color: good ? '#12B76A' : '#F04438',
          border: `1px solid ${good ? 'rgba(18,183,106,0.3)' : 'rgba(240,68,56,0.3)'}`,
        }}
      >
        {good ? '✓ Meeting SLO' : '✗ Breaching SLO'}
      </Tag>
      {description && (
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>{description}</div>
      )}
    </div>
  );
}

/**
 *
 * @param root0
 * @param root0.isLoading
 * @param root0.availabilityPct
 * @param root0.p95Ms
 * @param root0.errorBudget
 * @param root0.isCompliant
 * @param root0.compliancePct
 * @param root0.timeseriesLength
 * @param root0.breachedCount
 * @param root0.totalRequests
 * @param root0.averageLatencyMs
 * @param root0.availabilityTarget
 * @param root0.p95TargetMs
 */
export default function SloHealthGauges({
  isLoading,
  availabilityPct,
  p95Ms,
  errorBudget,
  isCompliant,
  compliancePct,
  timeseriesLength,
  breachedCount,
  totalRequests,
  averageLatencyMs,
  availabilityTarget,
  p95TargetMs,
}: SloHealthGaugesProps) {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
      <Col xs={24}>
        <Card title={<span><ShieldCheck size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />SLO Health</span>}>
          {isLoading ? (
            <Skeleton active paragraph={{ rows: 3 }} />
          ) : (
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
              <SloGauge
                title="Availability"
                value={availabilityPct}
                target={availabilityTarget}
                unit="%"
                description={`${n(totalRequests).toLocaleString()} total requests`}
              />
              <SloGauge
                title="P95 Latency"
                value={p95Ms}
                target={p95TargetMs}
                unit="ms"
                description={`Avg: ${n(averageLatencyMs).toFixed(1)}ms`}
              />
              <SloGauge
                title="Error Budget"
                value={errorBudget}
                target={50}
                unit="%"
                description={`${(100 - availabilityTarget).toFixed(1)}% total budget`}
              />
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  padding: '20px 24px',
                  background: 'var(--bg-tertiary, #1A1A1A)',
                  borderRadius: 8,
                  border: '1px solid var(--border-color, #2D2D2D)',
                  minWidth: 160,
                  flex: 1,
                  justifyContent: 'center',
                }}
              >
                <div style={{ fontSize: 32, fontWeight: 700, color: isCompliant ? '#12B76A' : '#F04438' }}>
                  {compliancePct}%
                </div>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>Window Compliance</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {timeseriesLength - breachedCount} / {timeseriesLength} windows compliant
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>SLO Target: {availabilityTarget}%</div>
              </div>
            </div>
          )}
        </Card>
      </Col>
    </Row>
  );
}
