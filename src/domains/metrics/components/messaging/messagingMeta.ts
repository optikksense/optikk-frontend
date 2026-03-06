import { APP_COLORS } from '@config/colorLiterals';
export const MQ_SYSTEM_META: Record<string, { label: string; color: string; badgeColor: string; gradient: string }> = {
  kafka: { label: 'Apache Kafka', color: APP_COLORS.hex_231f20, badgeColor: APP_COLORS.hex_e0e0e0, gradient: `linear-gradient(135deg, ${APP_COLORS.hex_231f20} 0%, ${APP_COLORS.hex_666} 100%)` },
  rabbitmq: { label: 'RabbitMQ', color: APP_COLORS.hex_ff6600, badgeColor: APP_COLORS.hex_ff6600, gradient: `linear-gradient(135deg, ${APP_COLORS.hex_ff6600} 0%, ${APP_COLORS.hex_ffb088} 100%)` },
  activemq: { label: 'ActiveMQ', color: APP_COLORS.hex_d32f2f, badgeColor: APP_COLORS.hex_d32f2f, gradient: `linear-gradient(135deg, ${APP_COLORS.hex_d32f2f} 0%, ${APP_COLORS.hex_ef9a9a} 100%)` },
  sqs: { label: 'Amazon SQS', color: APP_COLORS.hex_ff9900, badgeColor: APP_COLORS.hex_ff9900, gradient: `linear-gradient(135deg, ${APP_COLORS.hex_ff9900} 0%, ${APP_COLORS.hex_ffd599} 100%)` },
  nats: { label: 'NATS', color: APP_COLORS.hex_27aae1, badgeColor: APP_COLORS.hex_27aae1, gradient: `linear-gradient(135deg, ${APP_COLORS.hex_27aae1} 0%, ${APP_COLORS.hex_8dd8f8} 100%)` },
  pulsar: { label: 'Apache Pulsar', color: APP_COLORS.hex_188fff, badgeColor: APP_COLORS.hex_188fff, gradient: `linear-gradient(135deg, ${APP_COLORS.hex_188fff} 0%, ${APP_COLORS.hex_92cbff} 100%)` },
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
    color: APP_COLORS.hex_5e60ce,
    badgeColor: APP_COLORS.hex_5e60ce,
    gradient: `linear-gradient(135deg, ${APP_COLORS.hex_5e60ce} 0%, ${APP_COLORS.hex_48cae4} 100%)`,
  };
}
