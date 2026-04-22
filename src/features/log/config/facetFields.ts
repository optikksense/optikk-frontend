import { LOGS_FIELDS, type QueryFieldOption } from "@features/explorer/constants/fields";

/**
 * Re-export of the canonical logs field list. The explorer foundation owns
 * the source of truth in `constants/fields.ts:LOGS_FIELDS` so logs + traces
 * agree on label/type/op metadata. This file exists because the plan
 * scopes `config/facetFields.ts` to the logs feature — it stays a thin
 * shim so the module's import surface matches the spec without forking
 * the list.
 */
export const LOG_FACET_FIELDS: readonly QueryFieldOption[] = LOGS_FIELDS;

/** Quick lookup map for label rendering in the facet rail. */
export const LOG_FIELD_LABELS: Readonly<Record<string, string>> = Object.fromEntries(
  LOG_FACET_FIELDS.map((field) => [field.key, field.label])
);

export function labelForLogField(key: string): string {
  return LOG_FIELD_LABELS[key] ?? key;
}

export type { QueryFieldOption };
