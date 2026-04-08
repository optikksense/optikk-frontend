/**
 *
 */
export type EntityId = string | number;

/**
 *
 */
export type TimestampValue = string | number | Date;

/**
 *
 */
export type StatusValue = "healthy" | "degraded" | "unhealthy" | "unknown" | string;

/**
 *
 */
export interface NamedEntity {
  readonly id?: EntityId;
  readonly name: string;
}
