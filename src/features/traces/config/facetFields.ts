/**
 * Facet field definitions for the traces explorer. Re-exported from the
 * shared explorer `TRACES_FIELDS` so there is one source of truth
 * for field metadata (label / group / allowed operators).
 */
import { type QueryFieldOption, TRACES_FIELDS } from "@/features/explorer/constants/fields";

export const TRACES_FACET_FIELDS: readonly QueryFieldOption[] = TRACES_FIELDS;

/** Fieldkey → display label, consumed by the facet rail. */
export const TRACES_FIELD_LABELS: Readonly<Record<string, string>> = Object.fromEntries(
  TRACES_FIELDS.map((field) => [field.key, field.label])
);
