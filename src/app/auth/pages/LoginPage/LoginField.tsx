import type { ReactNode } from "react";

interface LoginFieldProps {
  readonly id: string;
  readonly label: string;
  readonly type: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder: string;
  readonly icon: ReactNode;
  readonly endSlot?: ReactNode;
  readonly required?: boolean;
  readonly autoComplete?: string;
}

/**
 * Reusable login field — uppercase label, left icon, optional right action slot.
 */
export function LoginField({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  icon,
  endSlot,
  required,
  autoComplete,
}: LoginFieldProps) {
  const inputClass = endSlot ? "login-input login-input--has-end" : "login-input";

  return (
    <div className="login-field-group">
      <label htmlFor={id} className="login-label">
        {label}
      </label>
      <div className="login-input-wrap">
        <span className="login-input-icon">{icon}</span>
        <input
          id={id}
          data-testid={`login-${id}`}
          className={inputClass}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
        />
        {endSlot}
      </div>
    </div>
  );
}
