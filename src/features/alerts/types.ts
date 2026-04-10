// Alerts feature types — mirrors the backend alerting module contract
// (see optikk-backend plan: jazzy-exploring-mccarthy.md).

export type AlertSeverity = "p1" | "p2" | "p3" | "p4" | "p5";

export type AlertRuleState = "ok" | "no_data" | "warn" | "alert" | "muted";

export type AlertConditionType =
  | "slo_burn_rate"
  | "error_rate"
  | "metric_threshold"
  | "log_count"
  | "absence";

export type AlertOperator = "gt" | "lt" | "eq" | "gte" | "lte";

export interface AlertWindow {
  readonly name: string;
  readonly secs: number;
}

export interface AlertTargetRef {
  readonly serviceId?: string;
  readonly serviceName?: string;
  readonly sloId?: string;
  readonly env?: string;
  readonly metric?: string;
  readonly [key: string]: string | number | undefined;
}

export interface AlertInstance {
  readonly instanceKey: string;
  readonly groupValues: Readonly<Record<string, string>>;
  readonly state: AlertRuleState;
  readonly values: Readonly<Record<string, number>>;
  readonly pendingSince?: string | null;
  readonly firedAt?: string | null;
  readonly resolvedAt?: string | null;
  readonly lastNotifiedAt?: string | null;
  readonly ackedBy?: string | null;
  readonly ackedUntil?: string | null;
}

export interface AlertSilence {
  readonly startsAt: string;
  readonly endsAt: string;
  readonly recurrence?: string | null;
  readonly matchTags?: Readonly<Record<string, string>>;
}

export interface AlertRule {
  readonly id: string;
  readonly teamId: number;
  readonly name: string;
  readonly description: string;
  readonly conditionType: AlertConditionType;
  readonly targetRef: AlertTargetRef;
  readonly groupBy: readonly string[];
  readonly windows: readonly AlertWindow[];
  readonly operator: AlertOperator;
  readonly warnThreshold: number | null;
  readonly criticalThreshold: number;
  readonly recoveryThreshold: number | null;
  readonly forSecs: number;
  readonly recoverForSecs: number;
  readonly keepAliveSecs: number;
  readonly noDataSecs: number;
  readonly severity: AlertSeverity;
  readonly notifyTemplate: string;
  readonly maxNotifsPerHour: number;
  readonly slackWebhookUrl: string;
  readonly ruleState: AlertRuleState;
  readonly lastEvalAt: string | null;
  readonly instances: readonly AlertInstance[];
  readonly muteUntil: string | null;
  readonly silences: readonly AlertSilence[];
  readonly enabled: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
  readonly updatedBy: string;
}

export interface AlertIncident {
  readonly alertId: string;
  readonly ruleName: string;
  readonly severity: AlertSeverity;
  readonly state: AlertRuleState;
  readonly instanceKey: string;
  readonly groupValues: Readonly<Record<string, string>>;
  readonly firedAt: string;
  readonly resolvedAt?: string | null;
  readonly ackedBy?: string | null;
  readonly values: Readonly<Record<string, number>>;
  readonly deployRefs?: ReadonlyArray<{ deployId: string; service: string; deployedAt: string }>;
}

export interface AlertEvent {
  readonly ts: string;
  readonly alertId: string;
  readonly instanceKey: string;
  readonly kind:
    | "transition"
    | "edit"
    | "mute"
    | "ack"
    | "silence"
    | "dispatch"
    | "dispatch_failed";
  readonly fromState?: AlertRuleState | null;
  readonly toState?: AlertRuleState | null;
  readonly actorUserId?: string | null;
  readonly message?: string;
  readonly values?: Readonly<Record<string, number>>;
}

export interface AlertBacktestPoint {
  readonly ts: string;
  readonly state: AlertRuleState;
  readonly values: Readonly<Record<string, number>>;
}

export interface AlertBacktestResult {
  readonly points: readonly AlertBacktestPoint[];
  readonly transitions: readonly AlertEvent[];
}

export interface AlertTestResult {
  readonly wouldFire: boolean;
  readonly state: AlertRuleState;
  readonly windows: Readonly<Record<string, number>>;
  readonly timeseries: ReadonlyArray<{ ts: string; value: number }>;
}

export interface AlertRulePayload {
  readonly name: string;
  readonly description?: string;
  readonly conditionType: AlertConditionType;
  readonly targetRef: AlertTargetRef;
  readonly groupBy: readonly string[];
  readonly windows: readonly AlertWindow[];
  readonly operator: AlertOperator;
  readonly warnThreshold?: number | null;
  readonly criticalThreshold: number;
  readonly recoveryThreshold?: number | null;
  readonly forSecs: number;
  readonly recoverForSecs: number;
  readonly keepAliveSecs: number;
  readonly noDataSecs: number;
  readonly severity: AlertSeverity;
  readonly notifyTemplate: string;
  readonly maxNotifsPerHour: number;
  readonly slackWebhookUrl: string;
  readonly enabled: boolean;
}
