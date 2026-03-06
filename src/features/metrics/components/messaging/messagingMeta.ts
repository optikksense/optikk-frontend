export const MQ_SYSTEM_META: Record<string, { label: string; color: string; badgeColor: string; gradient: string }> = {
  kafka: { label: 'Apache Kafka', color: '#231F20', badgeColor: '#e0e0e0', gradient: 'linear-gradient(135deg, #231F20 0%, #666 100%)' },
  rabbitmq: { label: 'RabbitMQ', color: '#FF6600', badgeColor: '#FF6600', gradient: 'linear-gradient(135deg, #FF6600 0%, #FFB088 100%)' },
  activemq: { label: 'ActiveMQ', color: '#D32F2F', badgeColor: '#D32F2F', gradient: 'linear-gradient(135deg, #D32F2F 0%, #EF9A9A 100%)' },
  sqs: { label: 'Amazon SQS', color: '#FF9900', badgeColor: '#FF9900', gradient: 'linear-gradient(135deg, #FF9900 0%, #FFD599 100%)' },
  nats: { label: 'NATS', color: '#27AAE1', badgeColor: '#27AAE1', gradient: 'linear-gradient(135deg, #27AAE1 0%, #8DD8F8 100%)' },
  pulsar: { label: 'Apache Pulsar', color: '#188FFF', badgeColor: '#188FFF', gradient: 'linear-gradient(135deg, #188FFF 0%, #92CBFF 100%)' },
};

/**
 *
 * @param value
 */
export const n = (value: any): number => (value == null || Number.isNaN(Number(value)) ? 0 : Number(value));

/**
 *
 * @param system
 */
export function getMqMeta(system: string) {
  const key = (system || '').toLowerCase();
  return MQ_SYSTEM_META[key] || {
    label: system || 'Queue',
    color: '#5E60CE',
    badgeColor: '#5E60CE',
    gradient: 'linear-gradient(135deg, #5E60CE 0%, #48CAE4 100%)',
  };
}
