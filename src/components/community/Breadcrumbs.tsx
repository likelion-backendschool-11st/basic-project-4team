import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../common/Icon';

export interface BreadcrumbsProps {
  readonly items: readonly { readonly label: string; readonly to: string }[];
  readonly current: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, current }) => (
  <nav aria-label="breadcrumb" className="flex flex-wrap items-center gap-space-xs text-muted font-body-sm text-body-sm mb-space-md">
    {items.map((item) => (
      <React.Fragment key={item.label}>
        <Link className="hover:text-primary transition-colors" to={item.to}>
          {item.label}
        </Link>
        <Icon className="text-[14px]" name="chevron_right" />
      </React.Fragment>
    ))}
    <span className="text-on-surface font-bold">{current}</span>
  </nav>
);

export default Breadcrumbs;
