export interface WaterfallSpan {
  readonly span_id: string;
  readonly parent_span_id?: string | null;
  readonly start_time: string;
  readonly end_time: string;
  readonly service_name?: string;
  readonly operation_name?: string;
  readonly status?: string;
  readonly span_kind?: string;
  readonly kind_string?: string;
  readonly duration_ms?: number;
  readonly has_error?: boolean;
}

export interface WaterfallTreeSpan extends WaterfallSpan {
  readonly depth: number;
  readonly leftPct: number;
  readonly widthPct: number;
  readonly barColor: string;
  readonly durationPct: string;
  readonly childCount: number;
}
