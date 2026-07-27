import type { TraceRecord } from "@shared/api/traces/schemas";

interface PathNode {
  readonly span: TraceRecord;
  readonly startMs: number;
  readonly ownEndMs: number;
  subtreeEndMs: number;
  readonly children: string[];
}

function spanStartMs(span: TraceRecord): number {
  if (span.startNs > 0) return span.startNs / 1_000_000;
  const parsed = Date.parse(span.startTime);
  return Number.isFinite(parsed) ? parsed : 0;
}

function isRootParent(parentId: string | undefined): boolean {
  return !parentId || parentId.replaceAll("\0", "") === "0000000000000000";
}

// Derives the same longest descendant chain used for waterfall highlighting
// from the span list that the page already fetched.
export function deriveCriticalPathSpanIds(spans: readonly TraceRecord[]): Set<string> {
  const nodes = new Map<string, PathNode>();
  for (const span of spans) {
    const startMs = spanStartMs(span);
    nodes.set(span.spanId, {
      span,
      startMs,
      ownEndMs: startMs + span.durationMs,
      subtreeEndMs: startMs + span.durationMs,
      children: [],
    });
  }

  const roots: string[] = [];
  for (const node of nodes.values()) {
    const parent = node.span.parentSpanId;
    const parentNode = parent ? nodes.get(parent) : undefined;
    if (isRootParent(parent) || !parentNode) {
      roots.push(node.span.spanId);
    } else {
      parentNode.children.push(node.span.spanId);
    }
  }

  for (const root of roots) {
    const stack: Array<{ id: string; visited: boolean }> = [{ id: root, visited: false }];
    while (stack.length > 0) {
      const frame = stack.pop();
      if (!frame) break;
      const node = nodes.get(frame.id);
      if (!node) continue;
      if (!frame.visited) {
        stack.push({ id: frame.id, visited: true });
        for (const child of node.children) stack.push({ id: child, visited: false });
        continue;
      }
      node.subtreeEndMs = node.children.reduce(
        (end, child) => Math.max(end, nodes.get(child)?.subtreeEndMs ?? end),
        node.ownEndMs
      );
    }
  }

  let current = roots.reduce<string | null>((best, candidate) => {
    if (!best) return candidate;
    return (nodes.get(candidate)?.subtreeEndMs ?? 0) > (nodes.get(best)?.subtreeEndMs ?? 0)
      ? candidate
      : best;
  }, null);

  const result = new Set<string>();
  while (current) {
    result.add(current);
    const node = nodes.get(current);
    if (!node || node.children.length === 0) break;
    current = node.children.reduce((best, candidate) => {
      const bestNode = nodes.get(best);
      const candidateNode = nodes.get(candidate);
      if (!bestNode) return candidate;
      if (!candidateNode) return best;
      if (candidateNode.subtreeEndMs !== bestNode.subtreeEndMs) {
        return candidateNode.subtreeEndMs > bestNode.subtreeEndMs ? candidate : best;
      }
      return candidateNode.startMs > bestNode.startMs ? candidate : best;
    });
  }
  return result;
}

export function deriveErrorSpanIds(spans: readonly TraceRecord[]): Set<string> {
  return new Set(
    spans
      .filter((span) => span.hasError || span.status.toUpperCase().includes("ERROR"))
      .map((span) => span.spanId)
  );
}
