import { useURLFilters } from '@hooks/useURLFilters';
import { useUrlSyncedTab } from '@hooks/useUrlSyncedTab';

const METRICS_URL_FILTER_CONFIG = {
    params: [
        { key: 'service', type: 'string' as const, defaultValue: '' },
        { key: 'errorsOnly', type: 'boolean' as const, defaultValue: false },
    ],
};

/**
 *
 */
export function useMetricsState() {
    /* ── URL-synced filter state for service & errorsOnly ── */
    const {
        values: urlValues,
        setters: urlSetters,
    } = useURLFilters(METRICS_URL_FILTER_CONFIG);

    const selectedService = urlValues.service || null;
    const setSelectedService = (v: string | null) => urlSetters.service(v || '');
    const showErrorsOnly = urlValues.errorsOnly;
    const setShowErrorsOnly = urlSetters.errorsOnly;

    const { activeTab, setActiveTab, onTabChange } = useUrlSyncedTab({
        allowedTabs: ['overview', 'latency'] as const,
        defaultTab: 'overview',
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
