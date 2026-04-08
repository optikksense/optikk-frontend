import { APP_COLORS } from "@config/colorLiterals";

export const NODE_WIDTH = 252;
export const NODE_HEIGHT = 94;
export const NODE_GAP_Y = 34;
export const STAGE_GAP_X = 320;
export const PAD_LEFT = 80;
export const PAD_RIGHT = 110;
export const PAD_TOP = 88;
export const PAD_BOTTOM = 70;

export function truncate(text: any, max = 30) {
  const value = String(text || "");
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}...`;
}

export function inferDomain(name = "") {
  const value = name.toLowerCase();
  if (
    value.includes("kafka") ||
    value.includes("rabbit") ||
    value.includes("sqs") ||
    value.includes("pulsar")
  )
    return "kafka";
  if (value.includes("redis") || value.includes("cache")) return "redis";
  if (
    value.includes("postgres") ||
    value.includes("mysql") ||
    value.includes("mongo") ||
    value.includes("sql") ||
    value.includes("db")
  )
    return "postgresql";
  if (value.includes("k8s") || value.includes("kube") || value.includes("pod")) return "kubernetes";
  return "application";
}

export function nodeSeverity(node: any = {}) {
  const risk = Number(node.riskScore || 0);
  const status = String(node.status || "").toLowerCase();

  if (status === "unhealthy" || risk >= 75) {
    return { key: "critical", label: "CRITICAL", color: APP_COLORS.hex_ff4d5a_2 };
  }
  if (status === "degraded" || risk >= 55) {
    return { key: "high", label: "HIGH", color: APP_COLORS.hex_f7b63a_2 };
  }
  if (risk >= 30) {
    return { key: "medium", label: "MEDIUM", color: APP_COLORS.hex_c8d43d_2 };
  }
  return { key: "low", label: "LOW", color: APP_COLORS.hex_4ade80 };
}

export function buildPath(fromX: number, fromY: number, toX: number, toY: number) {
  const curve = Math.max((toX - fromX) * 0.45, 90);
  return `M ${fromX} ${fromY} C ${fromX + curve} ${fromY}, ${toX - curve} ${toY}, ${toX} ${toY}`;
}

export function buildLayout(nodes: readonly any[], edges: readonly any[]) {
  const names = nodes.map((n) => n.name).filter(Boolean);
  const nodeSet = new Set(names);
  const nodeMap = new Map(nodes.map((n) => [n.name, n]));

  const outgoing = new Map<string, string[]>();
  const incoming = new Map<string, number>();
  names.forEach((name) => {
    outgoing.set(name, []);
    incoming.set(name, 0);
  });

  const cleanEdges = edges.filter(
    (edge) => nodeSet.has(edge.source) && nodeSet.has(edge.target) && edge.source !== edge.target
  );
  cleanEdges.forEach((edge) => {
    outgoing.get(edge.source)?.push(edge.target);
    incoming.set(edge.target, (incoming.get(edge.target) || 0) + 1);
  });

  const stageByName = new Map<string, number>();
  const indegree = new Map(incoming);
  const queue = names.filter((name) => (indegree.get(name) || 0) === 0);
  queue.forEach((name) => stageByName.set(name, 0));

  const processed = new Set();
  const mutableQueue = [...queue];
  while (mutableQueue.length > 0) {
    const current = mutableQueue.shift()!;
    processed.add(current);
    const nextStage = (stageByName.get(current) || 0) + 1;
    (outgoing.get(current) || []).forEach((target) => {
      if (nextStage > (stageByName.get(target) || 0)) {
        stageByName.set(target, nextStage);
      }
      indegree.set(target, (indegree.get(target) || 0) - 1);
      if ((indegree.get(target) || 0) <= 0) {
        mutableQueue.push(target);
      }
    });
  }

  if (processed.size < names.length) {
    names.forEach((name) => {
      if (!stageByName.has(name)) stageByName.set(name, 0);
    });
    for (let i = 0; i < names.length; i++) {
      let changed = false;
      cleanEdges.forEach((edge) => {
        const candidate = (stageByName.get(edge.source) || 0) + 1;
        if (candidate > (stageByName.get(edge.target) || 0)) {
          stageByName.set(edge.target, candidate);
          changed = true;
        }
      });
      if (!changed) break;
    }
  }

  const columns: any[][] = [];
  names.forEach((name) => {
    const stage = Math.max(0, stageByName.get(name) || 0);
    if (!columns[stage]) columns[stage] = [];
    columns[stage].push(nodeMap.get(name));
  });

  const stageColumns = columns.filter(Boolean).map((column) =>
    [...column].sort((a, b) => {
      const sevDiff =
        (nodeSeverity(b).key === "critical" ? 1 : 0) - (nodeSeverity(a).key === "critical" ? 1 : 0);
      if (sevDiff !== 0) return sevDiff;
      return Number(b.riskScore || 0) - Number(a.riskScore || 0);
    })
  );

  const maxCount = Math.max(...stageColumns.map((s) => s.length), 1);
  const contentHeight = Math.max(
    560,
    PAD_TOP + maxCount * NODE_HEIGHT + (maxCount - 1) * NODE_GAP_Y + PAD_BOTTOM
  );
  const contentWidth = Math.max(
    980,
    PAD_LEFT + (stageColumns.length - 1) * STAGE_GAP_X + NODE_WIDTH + PAD_RIGHT
  );

  const positions: Record<string, { x: number; y: number }> = {};
  stageColumns.forEach((stageNodes, stageIndex) => {
    const x = PAD_LEFT + stageIndex * STAGE_GAP_X;
    const totalHeight = stageNodes.length * NODE_HEIGHT + (stageNodes.length - 1) * NODE_GAP_Y;
    const startY = PAD_TOP + Math.max((contentHeight - PAD_TOP - PAD_BOTTOM - totalHeight) / 2, 0);
    stageNodes.forEach((node, idx) => {
      positions[node.name] = {
        x,
        y: startY + idx * (NODE_HEIGHT + NODE_GAP_Y),
      };
    });
  });

  const incidentCount = new Map(names.map((name) => [name, 0]));
  cleanEdges.forEach((edge) => {
    if (Number(edge.errorRate || 0) > 5) {
      incidentCount.set(edge.source, (incidentCount.get(edge.source) || 0) + 1);
      incidentCount.set(edge.target, (incidentCount.get(edge.target) || 0) + 1);
    }
  });

  return {
    stageColumns,
    positions,
    contentWidth,
    contentHeight,
    incidentCount,
    edges: cleanEdges,
  };
}
