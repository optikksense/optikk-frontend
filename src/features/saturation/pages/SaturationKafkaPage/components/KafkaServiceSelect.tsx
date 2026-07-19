interface KafkaServiceSelectProps {
  readonly services: readonly string[];
  readonly value: string;
  readonly onChange: (service: string) => void;
}

export function KafkaServiceSelect({ services, value, onChange }: KafkaServiceSelectProps) {
  return (
    <label className="flex min-w-0 items-center gap-3">
      <span className="shrink-0 font-semibold text-[11px] text-foreground-muted uppercase tracking-wider">
        Service
      </span>
      <select
        aria-label="Kafka service"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 w-[280px] min-w-0 max-w-full rounded-md border border-border bg-card px-2.5 font-mono text-[13px] text-foreground outline-none focus:border-primary"
      >
        {services.map((service) => (
          <option key={service} value={service}>
            {service}
          </option>
        ))}
      </select>
    </label>
  );
}
