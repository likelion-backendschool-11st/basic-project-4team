import React from 'react';
import { Link } from 'react-router-dom';
import { trendingSidebar } from '../../data/community';
import { ROUTES } from '../../data/layout';
import { useTrendingItems } from '../../hooks/community/useTrendingItems';
import { Icon } from '../common/Icon';

export interface TrendingItemsSidebarProps {
  readonly currentItemId: string;
}

/** 연관 품목 순위 (DB 토론글 수 기준) — 현재 품목은 강조, 나머지는 각 토론방으로 이동. */
export const TrendingItemsSidebar: React.FC<TrendingItemsSidebarProps> = ({ currentItemId }) => {
  const { items, status } = useTrendingItems();
  const notice =
    status === 'loading' ? trendingSidebar.loading : status === 'error' ? trendingSidebar.error : items.length === 0 ? trendingSidebar.empty : null;
  return (
    /* data-component="TrendingItemsSidebar" */
    <section className="bg-surface-container-lowest rounded-lg p-space-md shadow-sm">
      <div className="flex items-center justify-between mb-space-sm pb-space-xxs">
        <div className="flex items-center gap-1.5">
          <Icon className="text-tertiary text-[20px]" filled name={trendingSidebar.icon} />
          <h2 className="font-heading-4 text-heading-4 text-on-surface font-bold">{trendingSidebar.title}</h2>
        </div>
        <span className="font-micro text-micro text-muted">{trendingSidebar.period}</span>
      </div>
      <p className="font-caption text-caption text-muted mb-space-md">{trendingSidebar.description}</p>
      {notice && <p className="py-space-sm text-center font-caption text-caption text-muted">{notice}</p>}
      <ol className="flex flex-col gap-space-xs">
        {items.map((it) =>
          it.id === currentItemId ? (
            <li className="bg-mint-50 rounded-lg p-space-xs flex items-center justify-between group" key={it.id}>
              <div className="flex items-center gap-space-sm min-w-0">
                <span className="font-stat-value text-stat-value text-primary font-bold w-4 text-center">{it.rank}</span>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1 min-w-0">
                    <span className="font-ui-label text-ui-label text-on-surface truncate font-bold">{it.name}</span>
                    <span className="font-micro text-micro bg-primary text-on-primary px-1 rounded font-bold shrink-0">
                      {trendingSidebar.currentBadge}
                    </span>
                  </div>
                  <span className="font-caption text-caption text-muted truncate">{it.detail}</span>
                </div>
              </div>
              <span className="font-caption text-caption text-primary font-bold shrink-0">{it.count}</span>
            </li>
          ) : (
            <li key={it.id}>
              <Link
                className="rounded-lg p-space-xs flex items-center justify-between hover:bg-surface-container-low transition-colors group"
                to={ROUTES.itemDiscussion(it.id)}
              >
                <div className="flex items-center gap-space-sm min-w-0">
                  <span className="font-stat-value text-stat-value text-muted group-hover:text-on-surface font-bold w-4 text-center">{it.rank}</span>
                  <div className="flex flex-col min-w-0">
                    <span className="font-ui-label text-ui-label text-on-surface truncate group-hover:text-primary transition-colors">{it.name}</span>
                    <span className="font-caption text-caption text-muted truncate">{it.detail}</span>
                  </div>
                </div>
                <span className="font-caption text-caption text-muted group-hover:text-on-surface shrink-0">{it.count}</span>
              </Link>
            </li>
          ),
        )}
      </ol>
    </section>
  );
};

export default TrendingItemsSidebar;
