import React from 'react';
import { SectionCard } from './SectionCard';
import { SelectField } from './SelectField';
import { categoryCopy, type SelectOption } from '../../data/listingForm';
import type { LoadStatus } from '../../hooks/listing-form/useCategoryTree';

interface CategorySelectSectionProps {
  readonly step: number;
  readonly status: LoadStatus;
  readonly mainCategory: string;
  readonly subCategory: string;
  readonly mainOptions: readonly SelectOption[];
  readonly subOptions: readonly SelectOption[];
  readonly onMainChange: (value: string) => void;
  readonly onSubChange: (value: string) => void;
}

/** Create section 3 — main/sub category selects from the DB category tree (ITEM-01). */
export const CategorySelectSection: React.FC<CategorySelectSectionProps> = ({
  step,
  status,
  mainCategory,
  subCategory,
  mainOptions,
  subOptions,
  onMainChange,
  onSubChange,
}) => (
  // data-component="CategorySelector"
  <SectionCard
    inlineHint={<span className="font-caption text-caption text-muted">{categoryCopy.hint}</span>}
    step={step}
    title={categoryCopy.title}
    variant="create"
  >
    {status === 'ready' ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
        <SelectField label={categoryCopy.mainLabel} onChange={onMainChange} options={mainOptions} value={mainCategory} />
        <SelectField label={categoryCopy.subLabel} onChange={onSubChange} options={subOptions} value={subCategory} />
      </div>
    ) : (
      <p className={`font-caption text-caption ${status === 'error' ? 'text-error' : 'text-muted'}`} role="status">
        {status === 'error' ? categoryCopy.error : categoryCopy.loading}
      </p>
    )}
  </SectionCard>
);

export default CategorySelectSection;
