import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../common/Icon';
import type { BreadcrumbItem } from '../../data/listing';

interface ListingBreadcrumbsProps {
  readonly items: readonly BreadcrumbItem[];
  /** slash: buyer top bar (home icon, "/") · chevron: seller eyebrow trail. */
  readonly variant?: 'slash' | 'chevron';
}

/** Category breadcrumb trail. Last item is the current (non-link) node. */
export const ListingBreadcrumbs: React.FC<ListingBreadcrumbsProps> = ({ items, variant = 'slash' }) => {
  if (variant === 'chevron') {
    return (
      <nav
        aria-label="카테고리"
        className="flex flex-wrap items-center gap-space-xxs font-eyebrow text-eyebrow text-muted uppercase tracking-wider"
      >
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <React.Fragment key={item.label}>
              {item.to && !last ? (
                <Link className="hover:text-primary transition-colors" to={item.to}>
                  {item.label}
                </Link>
              ) : (
                <span className={last ? 'text-primary-container font-bold' : ''}>{item.label}</span>
              )}
              {!last && <Icon className="text-[13px] text-faint" name="chevron_right" />}
            </React.Fragment>
          );
        })}
      </nav>
    );
  }

  return (
    <nav aria-label="breadcrumb" className="flex flex-wrap items-center gap-space-xs font-caption text-caption text-muted">
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <React.Fragment key={item.label}>
            {item.to && !last ? (
              <Link className="hover:text-primary transition-colors flex items-center gap-1" to={item.to}>
                {i === 0 && <Icon className="text-[16px]" name="home" />}
                {item.label}
              </Link>
            ) : (
              <span className="text-ink font-ui-sm text-ui-sm">{item.label}</span>
            )}
            {!last && <span>/</span>}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default ListingBreadcrumbs;
