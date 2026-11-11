import React from 'react';
import { Link } from 'react-router-dom';
import type { Breadcrumb } from '../../data/search';

interface SearchSummaryHeaderProps {
  readonly query: string;
  readonly resultLabel: string;
  readonly totalText: string;
  readonly breadcrumbs: readonly Breadcrumb[];
}

/** "'키워드' 검색 결과 총 N개" title with breadcrumb trail. */
export const SearchSummaryHeader: React.FC<SearchSummaryHeaderProps> = ({ query, resultLabel, totalText, breadcrumbs }) => (
  // data-component="SearchSummaryHeader"
  <section className="py-space-lg flex flex-col md:flex-row md:items-baseline justify-between gap-space-sm">
    <div className="flex flex-wrap items-baseline gap-space-xs">
      <h1 className="font-heading-2 text-heading-2 text-ink tracking-tight font-bold">
        <span className="text-primary-container font-extrabold">‘{query}’</span> {resultLabel}
      </h1>
      <span className="font-stat-value text-stat-value text-muted font-normal">{totalText}</span>
    </div>
    <nav aria-label="breadcrumb" className="flex items-center gap-space-xs font-caption text-caption text-muted">
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={crumb.label}>
          {index > 0 ? <span className="text-hairline-strong">/</span> : null}
          {crumb.to ? (
            <Link className="hover:text-ink transition-colors" to={crumb.to}>
              {crumb.label}
            </Link>
          ) : (
            <span className="text-ink font-semibold">{crumb.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  </section>
);

export default SearchSummaryHeader;
