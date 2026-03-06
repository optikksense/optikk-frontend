import { APP_COLORS } from '@config/colorLiterals';
import { Breadcrumb, Badge } from 'antd';
import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import './PageHeader.css';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: any;
  actions?: ReactNode;
  badge?: number;
  breadcrumbs?: BreadcrumbItem[];
}

/**
 * Consistent page header with title, subtitle, optional breadcrumbs and action buttons.
 * @param root0
 * @param root0.title
 * @param root0.subtitle
 * @param root0.icon
 * @param root0.actions
 * @param root0.badge
 * @param root0.breadcrumbs
 */
export default function PageHeader({
  title,
  subtitle,
  icon,
  actions,
  badge,
  breadcrumbs,
}: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="page-header">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb
          className="page-header-breadcrumbs"
          items={breadcrumbs.map((crumb) => ({
            title: crumb.path ? (
              <a onClick={() => navigate(crumb.path || '')}>{crumb.label}</a>
            ) : (
              crumb.label
            ),
          }))}
        />
      )}
      <div className="page-header-row">
        <div className="page-header-title-group">
          {icon && <span className="page-header-icon">{React.isValidElement(icon) ? icon : React.createElement(icon, { size: 24 })}</span>}
          <h1 className="page-header-title">{title}</h1>
          {badge != null && badge > 0 && (
            <Badge count={badge} style={{ backgroundColor: APP_COLORS.hex_f04438, marginLeft: 12 }} />
          )}
        </div>
        {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
        {actions && <div className="page-header-actions">{actions}</div>}
      </div>
    </div>
  );
}
