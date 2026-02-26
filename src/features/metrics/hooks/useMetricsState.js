import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export function useMetricsState() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedService, setSelectedService] = useState(null);
    const [showErrorsOnly, setShowErrorsOnly] = useState(false);

    const queryTab = searchParams.get('tab') === 'latency' ? 'latency' : 'overview';
    const [activeTab, setActiveTab] = useState(queryTab);

    useEffect(() => {
        if (queryTab !== activeTab) {
            setActiveTab(queryTab);
        }
    }, [queryTab, activeTab]);

    const onTabChange = (tabKey) => {
        setActiveTab(tabKey);
        const next = new URLSearchParams(searchParams);
        if (tabKey === 'latency') {
            next.set('tab', 'latency');
        } else {
            next.delete('tab');
        }
        setSearchParams(next, { replace: true });
    };

    return {
        selectedService,
        setSelectedService,
        showErrorsOnly,
        setShowErrorsOnly,
        activeTab,
        setActiveTab,
        onTabChange
    };
}
