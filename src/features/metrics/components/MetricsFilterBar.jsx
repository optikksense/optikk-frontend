import { Switch } from 'antd';
import { AlertTriangle } from 'lucide-react';
import { FilterBar } from '@components/common';

export function MetricsFilterBar({ services, selectedService, setSelectedService, showErrorsOnly, setShowErrorsOnly }) {
    const serviceOptions = [
        { label: 'All Services', value: null },
        ...services.map((s) => ({ label: s.name || s.service_name || s.serviceName, value: s.name || s.service_name || s.serviceName })),
    ];

    return (
        <FilterBar
            filters={[
                {
                    type: 'select',
                    key: 'service',
                    placeholder: 'All Services',
                    options: serviceOptions,
                    value: selectedService,
                    onChange: setSelectedService,
                    width: 200,
                },
            ]}
            actions={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AlertTriangle size={14} style={{ color: showErrorsOnly ? '#F04438' : 'var(--text-muted)' }} />
                    <span style={{ fontSize: 13, color: showErrorsOnly ? '#F04438' : 'var(--text-muted)' }}>Errors Only</span>
                    <Switch size="small" checked={showErrorsOnly} onChange={setShowErrorsOnly} />
                </div>
            }
        />
    );
}
