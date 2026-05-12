export const AI_SPAN_TYPES = [
  "CHAT_MODEL",
  "EMBEDDING",
  "AGENT",
  "CHAIN",
  "TOOL",
  "RETRIEVER",
  "UNKNOWN",
] as const;

export type AiSpanType = (typeof AI_SPAN_TYPES)[number];

const SPAN_TYPE_OPERATIONS: Record<AiSpanType, readonly string[]> = {
  CHAT_MODEL: ["chat", "completion", "text_completion", "generate_content"],
  EMBEDDING: ["embeddings"],
  AGENT: ["invoke_agent", "create_agent"],
  CHAIN: ["invoke_workflow"],
  TOOL: ["execute_tool"],
  RETRIEVER: ["retrieval"],
  UNKNOWN: [],
};

export function inferAiSpanType(operation: string | null | undefined): AiSpanType {
  const normalized = (operation ?? "").trim().toLowerCase();
  for (const type of AI_SPAN_TYPES) {
    if (SPAN_TYPE_OPERATIONS[type].includes(normalized)) {
      return type;
    }
  }
  return "UNKNOWN";
}

export function operationsForAiSpanType(type: string): readonly string[] {
  return SPAN_TYPE_OPERATIONS[(type.toUpperCase() as AiSpanType)] ?? [];
}

export function labelForAiSpanType(type: AiSpanType): string {
  if (type === "CHAT_MODEL") return "Chat model";
  if (type === "EMBEDDING") return "Embedding";
  if (type === "AGENT") return "Agent";
  if (type === "CHAIN") return "Chain";
  if (type === "TOOL") return "Tool";
  if (type === "RETRIEVER") return "Retriever";
  return "Unknown";
}
