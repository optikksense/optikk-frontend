export function pillClass(active: boolean): string {
  return active
    ? "bg-[var(--color-primary)] text-white shadow-[var(--shadow-sm)]"
    : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]";
}

export function categoryBadgeVariant(category: string): "info" | "warning" {
  return category === "redis" ? "warning" : "info";
}
