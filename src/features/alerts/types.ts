export type AlertSeverity = "p1" | "p2" | "p3" | "p4" | "p5";

export type AlertRuleState = "ok" | "no_data" | "warn" | "alert" | "muted";

export type AlertPresetKind =
  | "service_error_rate"
  | "slo_burn_rate"
  | "http_check"
  | "ai_latency"
  | "ai_error_rate"
  | "ai_cost_spike"
  | "ai_quality_drop";

export type AlertOperator = "gt" | "lt" | "eq" | "gte" | "lte";

export interface AlertWindow {
  readonly name: string;
  readonly secs: number;
}

export interface AlertRuleScope {
  readonly service_name?: string;
  readonly environment?: string;
  readonly slo_id?: string;
  readonly url?: string;
  readonly method?: string;
  readonly expect_status?: number;
  readonly timeout_ms?: number;
  readonly follow_redirects?: boolean;
  readonly expect_body_substring?: string;
  readonly provider?: string;
  readonly model?: string;
  readonly prompt_template?: string;
}

export interface AlertRuleCondition {
  readonly threshold: number;
  readonly window_minutes?: number;
  readonly hold_minutes?: number;
  readonly severity?: AlertSeverity;
  readonly sensitivity?: "fast" | "balanced" | "slow";
  readonly evaluation_interval_minutes?: number;
}

export interface AlertRuleDelivery {
  readonly slack_webhook_url: string;
  readonly note?: string;
}

export interface AlertInstance {
  readonly instance_key: string;
  readonly group_values: Readonly<Record<string, string>>;
  readonly state: AlertRuleState;
  readonly values: Readonly<Record<string, number>>;
  readonly pending_since?: string | null;
  readonly fired_at?: string | null;
  readonly resolved_at?: string | null;
  readonly last_notified_at?: string | null;
  readonly acked_by?: string | number | null;
  readonly acked_until?: string | null;
}

export interface AlertSilence {
  readonly id?: string;
  readonly starts_at: string;
  readonly ends_at: string;
  readonly recurrence?: string | null;
  readonly match_tags?: Readonly<Record<string, string>>;
  readonly reason?: string;
}

export interface AlertRulePayload {
  readonly name: string;
  readonly description?: string;
  readonly preset_kind: AlertPresetKind;
  readonly scope: AlertRuleScope;
  readonly condition: AlertRuleCondition;
  readonly delivery: AlertRuleDelivery;
  readonly enabled: boolean;
}

export interface AlertRule extends AlertRulePayload {
  readonly id: string;
  readonly team_id: number;
  readonly summary: string;
  readonly rule_state: AlertRuleState;
  readonly last_eval_at: string | null;
  readonly instances: readonly AlertInstance[];
  readonly mute_until: string | null;
  readonly silences: readonly AlertSilence[];
  readonly created_at: string;
  readonly updated_at: string;
}

export interface AlertIncident {
  readonly alert_id: string;
  readonly rule_name: string;
  readonly preset_kind: AlertPresetKind;
  readonly summary: string;
  readonly severity: AlertSeverity;
  readonly state: AlertRuleState;
  readonly instance_key: string;
  readonly group_values: Readonly<Record<string, string>>;
  readonly fired_at?: string | null;
  readonly resolved_at?: string | null;
  readonly values: Readonly<Record<string, number>>;
}

export interface AlertEvent {
  readonly ts: string;
  readonly alert_id?: string;
  readonly instance_key?: string;
  readonly kind:
    | "transition"
    | "edit"
    | "mute"
    | "ack"
    | "silence"
    | "dispatch"
    | "dispatch_failed";
  readonly from_state?: AlertRuleState | null;
  readonly to_state?: AlertRuleState | null;
  readonly actor_user_id?: string | number | null;
  readonly message?: string;
  readonly values?: Readonly<Record<string, number>>;
}

export interface AlertActivityEntry {
  readonly ts: string;
  readonly alert_id: string;
  readonly rule_name: string;
  readonly preset_kind: AlertPresetKind;
  readonly summary: string;
  readonly kind: AlertEvent["kind"];
  readonly from_state?: AlertRuleState | null;
  readonly to_state?: AlertRuleState | null;
  readonly instance_key?: string;
  readonly actor_user_id?: string | number | null;
  readonly message?: string;
  readonly values?: Readonly<Record<string, number>>;
}

export interface AlertBacktestTransition {
  readonly ts: string;
  readonly instance_key: string;
  readonly from_state: AlertRuleState;
  readonly to_state: AlertRuleState;
  readonly values?: Readonly<Record<string, number>>;
  readonly message?: string;
}

export interface AlertBacktestResult {
  readonly transitions: readonly AlertBacktestTransition[];
  readonly ticks?: number;
}

export interface AlertTestResult {
  readonly would_fire: boolean;
  readonly evaluated_at: string;
  readonly results: ReadonlyArray<{
    instance_key: string;
    group_values?: Readonly<Record<string, string>>;
    values: Readonly<Record<string, number>>;
    no_data: boolean;
    would_fire: boolean;
  }>;
}

export interface AlertPreview {
  readonly summary: string;
  readonly engine: {
    readonly condition_type: string;
    readonly operator: AlertOperator;
    readonly windows: readonly AlertWindow[];
    readonly critical_threshold: number;
    readonly recovery_threshold?: number | null;
    readonly for_secs: number;
    readonly recover_for_secs: number;
    readonly no_data_secs: number;
    readonly severity: AlertSeverity;
  };
  readonly notification: {
    readonly title: string;
    readonly body: string;
  };
}

export interface AlertSlackTestResult {
  readonly delivered: boolean;
  readonly error?: string;
  readonly notification: {
    readonly title: string;
    readonly body: string;
  };
}

export interface AlertPrefill {
  readonly presetKind?: AlertPresetKind;
  readonly serviceName?: string;
  readonly environment?: string;
  readonly sloId?: string;
  readonly url?: string;
  readonly provider?: string;
  readonly model?: string;
  readonly promptTemplate?: string;
}
