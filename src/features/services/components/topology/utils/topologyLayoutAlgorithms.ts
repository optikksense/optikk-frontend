export interface LayoutNode {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LayoutEdge {
  source: string;
  target: string;
}

export interface LayoutResult {
  positions: Record<string, { x: number; y: number }>;
  width: number;
  height: number;
  stageColumns?: string[][];
}

const NODE_W = 220;
const NODE_H = 80;
const GAP_X = 280;
const GAP_Y = 32;
const PAD = 60;

// ── DAG Layout (topological left-to-right) ────────────────────

export function dagLayout(
  nodeNames: string[],
  edges: LayoutEdge[]
): LayoutResult {
  const nodeSet = new Set(nodeNames);
  const clean = edges.filter(
    (e) => nodeSet.has(e.source) && nodeSet.has(e.target) && e.source !== e.target
  );

  // Build adjacency
  const outgoing = new Map<string, string[]>();
  const inDeg = new Map<string, number>();
  for (const n of nodeNames) {
    outgoing.set(n, []);
    inDeg.set(n, 0);
  }
  for (const e of clean) {
    outgoing.get(e.source)!.push(e.target);
    inDeg.set(e.target, (inDeg.get(e.target) ?? 0) + 1);
  }

  // Topological sort → stage assignment
  const stage = new Map<string, number>();
  const queue = nodeNames.filter((n) => (inDeg.get(n) ?? 0) === 0);
  for (const n of queue) stage.set(n, 0);

  const q = [...queue];
  while (q.length) {
    const cur = q.shift()!;
    const next = (stage.get(cur) ?? 0) + 1;
    for (const t of outgoing.get(cur) ?? []) {
      if (next > (stage.get(t) ?? 0)) stage.set(t, next);
      inDeg.set(t, (inDeg.get(t) ?? 0) - 1);
      if ((inDeg.get(t) ?? 0) <= 0) q.push(t);
    }
  }

  // Handle cycles
  for (const n of nodeNames) {
    if (!stage.has(n)) stage.set(n, 0);
  }

  // Group into columns
  const columns: string[][] = [];
  for (const n of nodeNames) {
    const s = stage.get(n) ?? 0;
    if (!columns[s]) columns[s] = [];
    columns[s].push(n);
  }
  const stageColumns = columns.filter(Boolean);

  const maxCol = Math.max(...stageColumns.map((c) => c.length), 1);
  const width = PAD * 2 + (stageColumns.length - 1) * GAP_X + NODE_W;
  const height = PAD * 2 + maxCol * NODE_H + (maxCol - 1) * GAP_Y;

  const positions: Record<string, { x: number; y: number }> = {};
  for (let si = 0; si < stageColumns.length; si++) {
    const col = stageColumns[si];
    const x = PAD + si * GAP_X;
    const totalH = col.length * NODE_H + (col.length - 1) * GAP_Y;
    const startY = PAD + Math.max((height - PAD * 2 - totalH) / 2, 0);
    for (let ni = 0; ni < col.length; ni++) {
      positions[col[ni]] = { x, y: startY + ni * (NODE_H + GAP_Y) };
    }
  }

  return { positions, width, height, stageColumns };
}

// ── Radial Layout ─────────────────────────────────────────────

export function radialLayout(
  nodeNames: string[],
  edges: LayoutEdge[],
  centerNode?: string
): LayoutResult {
  if (nodeNames.length === 0) return { positions: {}, width: 400, height: 400 };

  const center = centerNode ?? nodeNames[0];
  const nodeSet = new Set(nodeNames);

  // BFS from center to compute distance
  const dist = new Map<string, number>();
  dist.set(center, 0);
  const adj = new Map<string, string[]>();
  for (const n of nodeNames) adj.set(n, []);
  for (const e of edges) {
    if (!nodeSet.has(e.source) || !nodeSet.has(e.target)) continue;
    adj.get(e.source)!.push(e.target);
    adj.get(e.target)!.push(e.source);
  }

  const bfsQ = [center];
  while (bfsQ.length) {
    const cur = bfsQ.shift()!;
    for (const nb of adj.get(cur) ?? []) {
      if (!dist.has(nb)) {
        dist.set(nb, (dist.get(cur) ?? 0) + 1);
        bfsQ.push(nb);
      }
    }
  }
  // Unreachable nodes
  for (const n of nodeNames) {
    if (!dist.has(n)) dist.set(n, 999);
  }

  // Group by ring
  const rings = new Map<number, string[]>();
  for (const [n, d] of dist) {
    if (!rings.has(d)) rings.set(d, []);
    rings.get(d)!.push(n);
  }

  const maxRing = Math.max(...rings.keys(), 0);
  const ringRadius = 160;
  const canvasSize = PAD * 2 + (maxRing + 1) * ringRadius * 2;
  const cx = canvasSize / 2;
  const cy = canvasSize / 2;

  const positions: Record<string, { x: number; y: number }> = {};
  positions[center] = { x: cx - NODE_W / 2, y: cy - NODE_H / 2 };

  for (let r = 1; r <= maxRing; r++) {
    const ring = rings.get(r) ?? [];
    const radius = r * ringRadius;
    for (let i = 0; i < ring.length; i++) {
      const angle = (2 * Math.PI * i) / ring.length - Math.PI / 2;
      positions[ring[i]] = {
        x: cx + radius * Math.cos(angle) - NODE_W / 2,
        y: cy + radius * Math.sin(angle) - NODE_H / 2,
      };
    }
  }

  return { positions, width: canvasSize, height: canvasSize };
}

// ── Force-Directed Layout ─────────────────────────────────────

export function forceLayout(
  nodeNames: string[],
  edges: LayoutEdge[]
): LayoutResult {
  if (nodeNames.length === 0) return { positions: {}, width: 400, height: 400 };

  const nodeSet = new Set(nodeNames);
  const clean = edges.filter(
    (e) => nodeSet.has(e.source) && nodeSet.has(e.target) && e.source !== e.target
  );

  // Initialize positions in a grid
  const cols = Math.ceil(Math.sqrt(nodeNames.length));
  const pos = new Map<string, { x: number; y: number; vx: number; vy: number }>();
  for (let i = 0; i < nodeNames.length; i++) {
    pos.set(nodeNames[i], {
      x: PAD + (i % cols) * (NODE_W + GAP_X / 2),
      y: PAD + Math.floor(i / cols) * (NODE_H + GAP_Y * 2),
      vx: 0,
      vy: 0,
    });
  }

  // Simple spring simulation
  const iterations = 80;
  const repulsion = 50000;
  const attraction = 0.002;
  const damping = 0.85;

  for (let iter = 0; iter < iterations; iter++) {
    // Repulsion between all pairs
    for (let i = 0; i < nodeNames.length; i++) {
      for (let j = i + 1; j < nodeNames.length; j++) {
        const a = pos.get(nodeNames[i])!;
        const b = pos.get(nodeNames[j])!;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
        const force = repulsion / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        a.vx -= fx;
        a.vy -= fy;
        b.vx += fx;
        b.vy += fy;
      }
    }

    // Attraction along edges
    for (const e of clean) {
      const a = pos.get(e.source)!;
      const b = pos.get(e.target)!;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const fx = dx * attraction;
      const fy = dy * attraction;
      a.vx += fx;
      a.vy += fy;
      b.vx -= fx;
      b.vy -= fy;
    }

    // Apply velocities
    for (const p of pos.values()) {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= damping;
      p.vy *= damping;
    }
  }

  // Normalize positions
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of pos.values()) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }

  const positions: Record<string, { x: number; y: number }> = {};
  for (const [name, p] of pos) {
    positions[name] = {
      x: p.x - minX + PAD,
      y: p.y - minY + PAD,
    };
  }

  return {
    positions,
    width: maxX - minX + NODE_W + PAD * 2,
    height: maxY - minY + NODE_H + PAD * 2,
  };
}

export type LayoutMode = 'dag' | 'radial' | 'force';

export function computeLayout(
  mode: LayoutMode,
  nodeNames: string[],
  edges: LayoutEdge[],
  centerNode?: string
): LayoutResult {
  switch (mode) {
    case 'radial':
      return radialLayout(nodeNames, edges, centerNode);
    case 'force':
      return forceLayout(nodeNames, edges);
    case 'dag':
    default:
      return dagLayout(nodeNames, edges);
  }
}

export { NODE_W, NODE_H };
