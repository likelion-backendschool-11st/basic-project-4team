import React from 'react';
import { Icon } from '../common/Icon';
import { LockedField } from './LockedField';
import { SectionCard } from './SectionCard';
import { lockedCategoryCopy } from '../../data/listingForm';
import { useCategorySelection } from '../../hooks/listing-form/useCategorySelection';

interface LockedCategorySectionProps {
  readonly step: number;
  readonly mainCategory: string;
  readonly subCategory: string;
  readonly catalogMatch: string | null;
  /** Editable attribute panel rendered below the locked fields. */
  readonly children?: React.ReactNode;
}

/** Edit section 2 — category & catalog item are read-only after registration. */
export const LockedCategorySection: React.FC<LockedCategorySectionProps> = ({
  step,
  mainCategory,
  subCategory,
  catalogMatch,
  children,
}) => {
  const { mainLabel, subLabel } = useCategorySelection(mainCategory, subCategory);
  const c = lockedCategoryCopy;
  return (
    // data-component="ImmutableCategoryNotice"
    <SectionCard
      right={
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container-high text-muted font-micro text-micro self-start sm:self-auto">
          <Icon className="text-[14px]" name="lock" />
          {c.lockBadge}
        </span>
      }
      step={step}
      title={c.title}
      variant="edit"
    >
      <div className="p-space-sm bg-mint-50 border border-mint-200 rounded flex items-center gap-space-xs">
        <Icon className="text-primary-container text-[18px] shrink-0" name="info" />
        <p className="font-caption text-caption text-forest flex-1">
          <strong>{c.noticeStrong}</strong>
          {c.noticeRest}
        </p>
      </div>
      <div className="space-y-space-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
          <LockedField label={c.mainLabel} value={mainLabel} />
          <LockedField label={c.subLabel} value={subLabel} />
        </div>
        <div>
          <span className="block font-caption text-caption text-muted mb-1">{c.catalogLabel}</span>
          <div className="relative flex items-center w-full bg-canvas-soft border border-hairline rounded pl-9 pr-3 py-2.5 cursor-not-allowed min-h-[42px]">
            <Icon className="text-primary-container text-[18px] absolute left-space-sm" name="verified" />
            <span className="flex-1 min-w-0 truncate font-ui-label text-ui-label text-ink font-bold">{catalogMatch ?? '-'}</span>
            <span className="ml-space-xs shrink-0 font-caption text-caption text-muted flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-primary-container inline-block" />
              {c.syncLabel}
            </span>
          </div>
        </div>
      </div>
      {children}
    </SectionCard>
  );
};

export default LockedCategorySection;
