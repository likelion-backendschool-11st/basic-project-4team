import React from 'react';
import { Icon } from '../common/Icon';
import { GuideQna } from './GuideQna';
import { createSidebarCopy, guideCategories } from '../../data/listingForm';

interface CreateGuideSidebarProps {
  /** Currently selected main category key (highlights the matching guide card). */
  readonly activeCategory: string;
}

/** Create-mode sticky sidebar: category attribute guide, benefit note, Q&A. */
export const CreateGuideSidebar: React.FC<CreateGuideSidebarProps> = ({ activeCategory }) => {
  const c = createSidebarCopy;
  return (
    // data-component="CategoryGuideSidebar"
    <aside className="lg:col-span-4 flex flex-col gap-space-md lg:sticky lg:top-[165px]">
      <div className="bg-canvas p-space-lg rounded shadow-sm">
        <div className="flex items-center gap-2 mb-space-md">
          <span className="w-6 h-6 rounded-full bg-forest text-on-primary font-ui-label text-ui-label flex items-center justify-center shrink-0">
            {c.stepNo}
          </span>
          <h2 className="font-heading-3 text-heading-3 text-ink">{c.title}</h2>
        </div>
        <p className="font-body-sm text-body-sm text-muted mb-space-md leading-relaxed">{c.intro}</p>
        <div className="flex flex-col gap-space-sm">
          {guideCategories.map((g) => {
            const active = g.key === activeCategory;
            return (
              <div className={`${active ? 'bg-mint-50' : 'bg-canvas-soft'} p-space-sm rounded`} key={g.key}>
                <div className="flex items-center justify-between gap-space-xs mb-1">
                  <span className={`font-ui-label text-ui-label flex items-center gap-1 ${active ? 'text-forest' : 'text-ink'}`}>
                    <Icon className="text-[16px]" name={g.icon} />
                    {g.title}
                  </span>
                  {active && (
                    <span className="bg-primary-container text-on-primary font-micro text-micro px-1.5 py-0.5 rounded shrink-0">
                      {c.activeBadge}
                    </span>
                  )}
                </div>
                <p className="font-caption text-caption text-body leading-relaxed">
                  <strong>{g.body}</strong>
                </p>
              </div>
            );
          })}
        </div>
        <div className="mt-space-md p-space-sm bg-lime-panel rounded">
          <div className="flex items-center gap-1.5 text-forest font-ui-label text-ui-label mb-1">
            <Icon className="text-[18px]" name="verified" />
            <span>{c.benefitTitle}</span>
          </div>
          <p className="font-caption text-caption text-on-secondary-fixed-variant leading-relaxed">{c.benefitBody}</p>
        </div>
      </div>
      <GuideQna items={c.qna} title={c.qnaTitle} />
    </aside>
  );
};

export default CreateGuideSidebar;
