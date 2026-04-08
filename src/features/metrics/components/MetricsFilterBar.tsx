import { Switch } from "@/components/ui";
import { AlertTriangle } from "lucide-react";

import { FilterBar } from "@shared/components/ui";

import { APP_COLORS } from "@config/colorLiterals";

import type { MetricsServiceOption } from "../types";

interface MetricsFilterBarProps {
  services: MetricsServiceOption[];
  selectedService: string | null;
  setSelectedService: (value: string | null) => void;
  showErrorsOnly: boolean;
  setShowErrorsOnly: (value: boolean) => void;
}

/**
 *
 */
export function MetricsFilterBar({
  services,
  selectedService,
  setSelectedService,
  showErrorsOnly,
  setShowErrorsOnly,
}: MetricsFilterBarProps) {
  const serviceOptions = [
    { label: "All Services", value: "" },
    ...services.map((service) => {
      const name = service.service_name ?? "Unknown";
      return { label: name, value: name };
    }),
  ];

  return (
    <FilterBar
      filters={[
        {
          type: "select",
          key: "service",
          placeholder: "All Services",
          options: serviceOptions,
          value: selectedService ?? "",
          onChange: (value) =>
            setSelectedService(typeof value === "string" && value.length > 0 ? value : null),
          width: 200,
        },
      ]}
      actions={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <AlertTriangle
            size={14}
            style={{ color: showErrorsOnly ? APP_COLORS.hex_f04438 : "var(--text-muted)" }}
          />
          <span
            style={{
              fontSize: 13,
              color: showErrorsOnly ? APP_COLORS.hex_f04438 : "var(--text-muted)",
            }}
          >
            Errors Only
          </span>
          <Switch
            size="sm"
            checked={showErrorsOnly}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setShowErrorsOnly(e.target.checked)
            }
          />
        </div>
      }
    />
  );
}
