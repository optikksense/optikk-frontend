export interface StructuredFilter {
  readonly field: string
  readonly operator: string
  readonly value: string
}

export function encodeStructuredFilters(filters: StructuredFilter[]): string | null {
  if (filters.length === 0) {
    return null
  }
  return filters
    .map((filter) => `${filter.field}:${filter.operator}:${encodeURIComponent(filter.value)}`)
    .join(";")
}

export function decodeStructuredFilters(raw: string | null): StructuredFilter[] {
  if (!raw) {
    return []
  }

  return raw.split(";").flatMap((chunk) => {
    const [field, operator, ...rest] = chunk.split(":")
    if (!field || !operator) {
      return []
    }
    return [{ field, operator, value: decodeURIComponent(rest.join(":")) }]
  })
}
