export interface ExplorerRecord {
  readonly id: string
  readonly primary: string
  readonly secondary: string
  readonly status: "healthy" | "warning" | "error"
  readonly value: number
}

export function buildExplorerRecords(scope: string): ExplorerRecord[] {
  return Array.from({ length: 250 }, (_, index) => ({
    id: `${scope}-${index}`,
    primary: `${scope} entity ${index + 1}`,
    secondary: `service:${scope}-api-${index % 12}`,
    status: index % 9 === 0 ? "error" : index % 4 === 0 ? "warning" : "healthy",
    value: 10 + (index % 50),
  }))
}

export function buildSeries(scope: string) {
  const base = Math.abs(
    scope.split("").reduce((total, character) => total + character.charCodeAt(0), 0),
  )
  const x = Array.from({ length: 48 }, (_, index) => Date.now() / 1000 - (48 - index) * 300)
  const y = x.map((_, index) => 40 + ((base + index * 7) % 30))
  return { x, y }
}
