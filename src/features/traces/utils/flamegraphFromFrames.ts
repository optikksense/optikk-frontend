import type { FlamegraphFrame } from "@shared/api/schemas/tracesSchemas";

import type { FlamegraphNode } from "../types";

/**
 * Converts a depth-first list of frames (with level) from GET /traces/:id/flamegraph
 * into the hierarchical shape expected by Flamegraph.tsx.
 */
export function flamegraphFramesToTree(frames: FlamegraphFrame[]): FlamegraphNode | null {
  if (frames.length === 0) return null;

  const stack: FlamegraphNode[] = [];
  const roots: FlamegraphNode[] = [];

  for (const frame of frames) {
    const node: FlamegraphNode = {
      name: frame.name,
      value: Math.max(frame.duration_ms, 0),
      metadata: {
        span_id: frame.span_id,
        self_time_ms: frame.self_time_ms,
        has_error: frame.has_error,
      },
    };

    while (stack.length > frame.level) {
      stack.pop();
    }

    if (frame.level === 0) {
      roots.push(node);
      stack.length = 0;
      stack.push(node);
      continue;
    }

    if (stack.length === 0) {
      roots.push(node);
      stack.push(node);
      continue;
    }

    const parent = stack[stack.length - 1];
    if (!parent.children) parent.children = [];
    parent.children.push(node);
    stack.push(node);
  }

  if (roots.length === 0) return null;
  if (roots.length === 1) {
    ensureInclusiveValues(roots[0]);
    return roots[0];
  }

  const synthetic: FlamegraphNode = {
    name: "Trace",
    value: roots.reduce((acc, r) => acc + r.value, 0),
    children: roots,
  };
  ensureInclusiveValues(synthetic);
  return synthetic;
}

/** Ensures each parent value is at least the sum of child values so layout does not overflow. */
function ensureInclusiveValues(node: FlamegraphNode): number {
  if (!node.children?.length) {
    return node.value;
  }
  let sum = 0;
  for (const child of node.children) {
    sum += ensureInclusiveValues(child);
  }
  node.value = Math.max(node.value, sum);
  return node.value;
}
