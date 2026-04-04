import { motion } from 'framer-motion';

const NODES = [
  { id: 'gateway', label: 'API Gateway', x: 360, y: 40, color: '#6366F1' },
  { id: 'users', label: 'Users Service', x: 160, y: 160, color: '#06B6D4' },
  { id: 'orders', label: 'Orders Service', x: 560, y: 160, color: '#06B6D4' },
  { id: 'postgres', label: 'PostgreSQL', x: 80, y: 300, color: '#F59E0B' },
  { id: 'redis', label: 'Redis', x: 280, y: 300, color: '#EF4444' },
  { id: 'kafka', label: 'Kafka', x: 480, y: 300, color: '#10B981' },
  { id: 'payments', label: 'Payments', x: 640, y: 300, color: '#8B5CF6' },
] as const;

const EDGES: readonly { from: string; to: string }[] = [
  { from: 'gateway', to: 'users' },
  { from: 'gateway', to: 'orders' },
  { from: 'users', to: 'postgres' },
  { from: 'users', to: 'redis' },
  { from: 'orders', to: 'kafka' },
  { from: 'orders', to: 'payments' },
];

function getNode(id: string) {
  return NODES.find((n) => n.id === id)!;
}

export default function ServiceMap() {
  return (
    <div className="component-card" style={{ padding: 24, overflow: 'hidden' }}>
      <svg viewBox="0 0 760 380" width="100%" height="100%" style={{ display: 'block' }}>
        {EDGES.map((e, i) => {
          const from = getNode(e.from);
          const to = getNode(e.to);
          return (
            <motion.line
              key={i}
              x1={from.x + 50}
              y1={from.y + 20}
              x2={to.x + 50}
              y2={to.y + 20}
              stroke="#334155"
              strokeWidth={1.5}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.6 }}
              transition={{ duration: 0.6, delay: 0.3 + i * 0.1 }}
            />
          );
        })}
        {NODES.map((node, i) => (
          <motion.g
            key={node.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
          >
            <rect
              x={node.x}
              y={node.y}
              width={100}
              height={40}
              rx={8}
              fill="#1E293B"
              stroke={node.color}
              strokeWidth={1.5}
            />
            <text
              x={node.x + 50}
              y={node.y + 24}
              textAnchor="middle"
              fill="#E2E8F0"
              fontSize={11}
              fontFamily="Inter, system-ui, sans-serif"
            >
              {node.label}
            </text>
          </motion.g>
        ))}
      </svg>
    </div>
  );
}
