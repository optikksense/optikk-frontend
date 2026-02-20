import React from 'react';
import { Breadcrumb, Badge } from 'antd';
import { useNavigate } from 'react-router-dom';
import './PageHeader.css';

/**
 * Consistent page header with title, subtitle, optional breadcrumbs and action buttons.
 * Replaces the inconsistent h1/Title headers across all pages.
 */
export default function PageHeader({
  title,
  subtitle,
  icon,
  actions,
  badge,
  breadcrumbs,
}) {
  const navigate = useNavigate();

  return (
    <div className="page-header">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb
          className="page-header-breadcrumbs"
          items={breadcrumbs.map((crumb, i) => ({
            title: crumb.path ? (
              <a onClick={() => navigate(crumb.path)}>{crumb.label}</a>
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
            <Badge count={badge} style={{ backgroundColor: '#F04438', marginLeft: 12 }} />
          )}
        </div>
        {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
        {actions && <div className="page-header-actions">{actions}</div>}
      </div>
    </div>
  );
}
