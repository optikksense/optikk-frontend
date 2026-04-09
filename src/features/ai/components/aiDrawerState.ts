import type { AiDrawerEntity } from "../types";

export const AI_DRAWER_PARAMS = {
  entity: "aiEntity",
  id: "aiEntityId",
  title: "aiTitle",
  data: "aiData",
  tab: "aiTab",
} as const;

export interface AiDrawerState {
  entity: AiDrawerEntity | null;
  id: string | null;
  title: string | null;
  data: Record<string, unknown> | null;
  tab: string | null;
}

function serializeAiDrawerData(data: Record<string, unknown>): string | null {
  try {
    return JSON.stringify(data);
  } catch {
    return null;
  }
}

function deserializeAiDrawerData(value: string | null): Record<string, unknown> | null {
  if (!value) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function buildAiDrawerSearch(
  currentSearch: string,
  entity: AiDrawerEntity,
  entityId: string,
  options?: {
    title?: string;
    data?: Record<string, unknown>;
    tab?: string;
  }
): string {
  const nextSearchParams = new URLSearchParams(currentSearch);
  nextSearchParams.set(AI_DRAWER_PARAMS.entity, entity);
  nextSearchParams.set(AI_DRAWER_PARAMS.id, entityId);

  if (options?.title) {
    nextSearchParams.set(AI_DRAWER_PARAMS.title, options.title);
  } else {
    nextSearchParams.delete(AI_DRAWER_PARAMS.title);
  }

  if (options?.tab) {
    nextSearchParams.set(AI_DRAWER_PARAMS.tab, options.tab);
  } else {
    nextSearchParams.delete(AI_DRAWER_PARAMS.tab);
  }

  const serializedData = options?.data ? serializeAiDrawerData(options.data) : null;
  if (serializedData) {
    nextSearchParams.set(AI_DRAWER_PARAMS.data, serializedData);
  } else {
    nextSearchParams.delete(AI_DRAWER_PARAMS.data);
  }

  const search = nextSearchParams.toString();
  return search ? `?${search}` : "";
}

export function clearAiDrawerSearch(currentSearch: string): string {
  const nextSearchParams = new URLSearchParams(currentSearch);
  nextSearchParams.delete(AI_DRAWER_PARAMS.entity);
  nextSearchParams.delete(AI_DRAWER_PARAMS.id);
  nextSearchParams.delete(AI_DRAWER_PARAMS.title);
  nextSearchParams.delete(AI_DRAWER_PARAMS.data);
  nextSearchParams.delete(AI_DRAWER_PARAMS.tab);
  const search = nextSearchParams.toString();
  return search ? `?${search}` : "";
}

export function readAiDrawerState(searchParams: URLSearchParams): AiDrawerState {
  const entity = searchParams.get(AI_DRAWER_PARAMS.entity) as AiDrawerEntity | null;
  const id = searchParams.get(AI_DRAWER_PARAMS.id);
  const title = searchParams.get(AI_DRAWER_PARAMS.title);
  const data = deserializeAiDrawerData(searchParams.get(AI_DRAWER_PARAMS.data));
  const tab = searchParams.get(AI_DRAWER_PARAMS.tab);

  return {
    entity,
    id,
    title,
    data,
    tab,
  };
}
