import React from 'react';
import type { LabeledCount } from '../../data/market';
import { Icon } from '../common/Icon';
import { GradePill } from './GradePill';

interface MarketCategoryHeaderProps {
  readonly title: string;
  readonly badge: string;
  readonly syncLabel: string;
  readonly tabs: readonly LabeledCount[];
  readonly activeTabId: string;
  readonly onTabChange: (id: string) => void;
  readonly gradeLabel: string;
  readonly grades: readonly LabeledCount[];
  readonly activeGradeId: string;
  readonly onGradeChange: (id: string) => void;
  readonly noticePrefix: string;
  readonly noticeStrong: string;
  readonly noticeSuffix: string;
  readonly chips: readonly string[];
}

/** Title, category tabs, grade pills and data-basis notice. */
export const MarketCategoryHeader: React.FC<MarketCategoryHeaderProps> = ({
  title,
  badge,
  syncLabel,
  tabs,
  activeTabId,
  onTabChange,
  gradeLabel,
  grades,
  activeGradeId,
  onGradeChange,
  noticePrefix,
  noticeStrong,
  noticeSuffix,
  chips,
}) => (
  // data-component="CategoryHeader"
  <div className="flex flex-col gap-space-md border-b border-hairline pb-space-sm">
    <div className="flex items-center justify-between gap-space-sm">
      <div className="flex items-center gap-space-xs">
        <h1 className="font-heading-2 text-heading-2 text-on-surface font-bold tracking-tight">{title}</h1>
        <span className="px-space-xs py-0.5 rounded bg-mint-100 text-forest font-caption text-caption font-bold">{badge}</span>
      </div>
      <div className="flex items-center gap-space-xs text-muted font-ui-sm text-ui-sm">
        <Icon className="text-[16px]" name="sync" />
        <span className="hidden sm:inline">{syncLabel}</span>
      </div>
    </div>

    <div className="flex items-center gap-space-lg font-ui-label text-ui-label font-bold border-b border-surface-container">
      {tabs.map((tab) => (
        <button
          aria-pressed={tab.id === activeTabId}
          className={
            tab.id === activeTabId
              ? 'pb-space-xs text-on-surface border-b-2 border-on-surface'
              : 'pb-space-xs text-muted hover:text-on-surface transition-colors'
          }
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>

    <div className="flex items-center gap-space-xs overflow-x-auto pt-space-xxs">
      <span className="text-caption font-bold text-muted mr-space-xxs shrink-0">{gradeLabel}</span>
      {grades.map((grade) => (
        <GradePill
          active={grade.id === activeGradeId}
          count={grade.count}
          key={grade.id}
          label={grade.label}
          onClick={() => onGradeChange(grade.id)}
        />
      ))}
    </div>

    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs text-caption text-muted pt-space-xxs">
      <div className="flex items-center gap-space-xs">
        <Icon className="text-[15px] text-primary" name="info" />
        <span>
          {noticePrefix} <strong>{noticeStrong}</strong> {noticeSuffix}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-space-xs">
        {chips.map((chip) => (
          <span className="px-space-xs py-0.5 bg-surface-container rounded text-muted font-micro text-micro" key={chip}>
            {chip}
          </span>
        ))}
      </div>
    </div>
  </div>
);

export default MarketCategoryHeader;
