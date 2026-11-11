import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../common/Icon';
import { ListingStatsCard } from './ListingStatsCard';
import { editSidebarCopy, guideCategories } from '../../data/listingForm';

interface EditGuideSidebarProps {
  readonly activeCategory: string;
}

/** Edit-mode sticky sidebar: attribute standards, market-data policy, listing stats. */
export const EditGuideSidebar: React.FC<EditGuideSidebarProps> = ({ activeCategory }) => {
  const c = editSidebarCopy;
  return (
    // data-component="CategoryAttributeGuide"
    <aside className="lg:col-span-4 flex flex-col gap-space-md lg:sticky lg:top-[165px]">
      <div className="bg-canvas border border-hairline rounded p-space-md">
        <div className="flex items-center gap-space-xs pb-space-xs border-b border-hairline mb-space-sm">
          <Icon className="text-primary-container text-[20px]" name="fact_check" />
          <h3 className="font-ui-label text-ui-label text-ink">{c.guideTitle}</h3>
        </div>
        <div className="space-y-space-sm text-caption font-caption text-body">
          {guideCategories.map((g) => {
            const active = g.key === activeCategory;
            return (
              <div
                className={`p-2.5 rounded border ${active ? 'bg-mint-50/70 border-mint-200' : 'bg-canvas-soft border-hairline'}`}
                key={g.key}
              >
                <div className={`flex items-center justify-between font-bold mb-1 ${active ? 'text-forest' : 'text-ink'}`}>
                  <span>{g.editTitle}</span>
                  {active && (
                    <span className="font-micro text-micro bg-mint-200 text-forest px-1.5 py-0.5 rounded">{c.activeBadge}</span>
                  )}
                </div>
                <p className="leading-relaxed text-muted">{g.editBody}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-canvas border border-hairline rounded p-space-md">
        <div className="flex items-center gap-space-xs pb-space-xs border-b border-hairline mb-space-sm">
          <Icon className="text-primary-container text-[20px]" name="shield" />
          <h3 className="font-ui-label text-ui-label text-ink">{c.policyTitle}</h3>
        </div>
        <ul className="space-y-space-xs font-caption text-caption text-body leading-relaxed">
          {c.policies.map((p) => (
            <li className="flex items-start gap-1.5" key={p.strong}>
              <Icon className="text-primary-container text-[16px] shrink-0 mt-0.5" name="check" />
              <span>
                <strong>{p.strong}</strong>
                {p.text}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-space-md pt-space-sm border-t border-hairline flex items-center justify-between gap-space-xs text-muted font-micro text-micro">
          <span>{c.contact}</span>
          <Link className="text-link hover:underline" to={c.guideLinkTo}>
            {c.guideLinkLabel}
          </Link>
        </div>
      </div>

      <ListingStatsCard label={c.statsLabel} stats={c.stats} />
    </aside>
  );
};

export default EditGuideSidebar;
