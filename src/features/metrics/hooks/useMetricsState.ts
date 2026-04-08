import { useURLFilters } from "@shared/hooks/useURLFilters";
import { useUrlSyncedTab } from "@shared/hooks/useUrlSyncedTab";

const METRICS_URL_FILTER_CONFIG = {
  params: [
    { key: "service", type: "string" as const, defaultValue: "" },
    { key: "errorsOnly", type: "boolean" as const, defaultValue: false },
  ],
};

interface UseMetricsStateResult {
  selectedService: string | null;
  setSelectedService: (value: string | null) => void;
  showErrorsOnly: boolean;
  setShowErrorsOnly: (value: boolean) => void;
  activeTab: "overview" | "latency";
  setActiveTab: (nextTab: "overview" | "latency") => void;
  onTabChange: (nextTab: string) => void;
}

/**
 *
 */
export function useMetricsState(): UseMetricsStateResult {
  const { values: urlValues, setters: urlSetters } = useURLFilters(METRICS_URL_FILTER_CONFIG);

  const selectedService =
    typeof urlValues.service === "string" && urlValues.service.length > 0
      ? urlValues.service
      : null;
  const setSelectedService = (value: string | null): void => {
    urlSetters.service(value || "");
  };

  const showErrorsOnly = urlValues.errorsOnly === true;
  const setShowErrorsOnly = (value: boolean): void => {
    urlSetters.errorsOnly(value);
  };

  const { activeTab, setActiveTab, onTabChange } = useUrlSyncedTab({
    allowedTabs: ["overview", "latency"] as const,
    defaultTab: "overview",
  });

  return {
    selectedService,
    setSelectedService,
    showErrorsOnly,
    setShowErrorsOnly,
    activeTab,
    setActiveTab,
    onTabChange,
  };
}
