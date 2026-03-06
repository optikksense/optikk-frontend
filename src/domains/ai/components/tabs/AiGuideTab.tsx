import { APP_COLORS } from '@config/colorLiterals';
import { Card, Col, Row } from 'antd';
import {
  Activity,
  AlertTriangle,
  Brain,
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Zap,
} from 'lucide-react';

/**
 *
 */
export default function AiGuideTab() {
  const attrs = [
    { section: 'Identity', color: APP_COLORS.hex_5e60ce, icon: <Brain size={15} />, attr: 'ai.model.name', desc: 'Model identifier — required to appear in the dashboard', example: 'gpt-4o' },
    { section: 'Identity', color: APP_COLORS.hex_5e60ce, icon: <Brain size={15} />, attr: 'ai.model.provider', desc: 'Provider / vendor name', example: 'openai' },
    { section: 'Identity', color: APP_COLORS.hex_5e60ce, icon: <Brain size={15} />, attr: 'ai.request.type', desc: 'Call type (chat, completion, embedding, rerank)', example: 'chat' },
    { section: 'Identity', color: APP_COLORS.hex_5e60ce, icon: <Brain size={15} />, attr: 'ai.application', desc: 'Calling service or product area', example: 'search-api' },
    { section: 'Performance', color: APP_COLORS.hex_06aed5, icon: <Clock size={15} />, attr: 'ai.latency.ms', desc: 'End-to-end latency in ms (usually equals span duration)', example: '1340' },
    { section: 'Performance', color: APP_COLORS.hex_06aed5, icon: <AlertTriangle size={15} />, attr: 'ai.timeout', desc: '"true" if the request timed out', example: 'true' },
    { section: 'Performance', color: APP_COLORS.hex_06aed5, icon: <Activity size={15} />, attr: 'ai.response.status', desc: 'HTTP or API status returned by the model endpoint', example: '200' },
    { section: 'Performance', color: APP_COLORS.hex_06aed5, icon: <Activity size={15} />, attr: 'ai.retry.count', desc: 'Number of retries before success or final failure', example: '2' },
    { section: 'Cost', color: APP_COLORS.hex_f79009, icon: <Zap size={15} />, attr: 'ai.tokens.prompt', desc: 'Input / prompt token count', example: '512' },
    { section: 'Cost', color: APP_COLORS.hex_f79009, icon: <Zap size={15} />, attr: 'ai.tokens.completion', desc: 'Output / completion token count', example: '256' },
    { section: 'Cost', color: APP_COLORS.hex_f79009, icon: <Zap size={15} />, attr: 'ai.tokens.system', desc: 'System-prompt token count (optional)', example: '128' },
    { section: 'Cost', color: APP_COLORS.hex_f79009, icon: <DollarSign size={15} />, attr: 'ai.cost.usd', desc: 'Estimated request cost in USD', example: '0.00430' },
    { section: 'Cost', color: APP_COLORS.hex_fdb022, icon: <CheckCircle size={15} />, attr: 'ai.cache.hit', desc: '"true" when a prompt cache was served', example: 'true' },
    { section: 'Cost', color: APP_COLORS.hex_fdb022, icon: <Zap size={15} />, attr: 'ai.cache.tokens', desc: 'Number of tokens served from cache', example: '384' },
    { section: 'Security', color: APP_COLORS.hex_f04438, icon: <Shield size={15} />, attr: 'ai.pii.detected', desc: '"true" if PII was found in the prompt or response', example: 'true' },
    { section: 'Security', color: APP_COLORS.hex_f04438, icon: <Eye size={15} />, attr: 'ai.pii.categories', desc: 'Comma-separated PII types detected', example: 'email,phone' },
    { section: 'Security', color: APP_COLORS.hex_f79009, icon: <ShieldAlert size={15} />, attr: 'ai.guardrail.blocked', desc: '"true" if a guardrail blocked / modified the request', example: 'true' },
    { section: 'Security', color: APP_COLORS.hex_9e77ed, icon: <ShieldCheck size={15} />, attr: 'ai.content.policy.triggered', desc: '"true" if a content policy rule was triggered', example: 'true' },
  ];

  const sections = [...new Set(attrs.map((item) => item.section))];

  return (
    <Row gutter={[16, 16]}>
      {sections.map((section) => {
        const items = attrs.filter((item) => item.section === section);
        const color = items[0].color;
        return (
          <Col xs={24} lg={12} key={section}>
            <Card title={<span style={{ color }}>{section} Attributes</span>} className="ai-chart-card">
              <div className="ai-guide-items">
                {items.map((item, index) => (
                  <div key={index} className="ai-guide-item">
                    <div className="ai-guide-icon" style={{ color: item.color }}>{item.icon}</div>
                    <div className="ai-guide-content">
                      <code className="ai-guide-attr">{item.attr}</code>
                      <div className="ai-guide-desc">{item.desc}</div>
                    </div>
                    <div className="ai-guide-example">
                      <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>e.g. </span>
                      <code style={{ fontSize: 11, color: item.color }}>{item.example}</code>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
}
