import React from 'react';
import { SectionCard } from './SectionCard';
import { SelectField } from './SelectField';
import { categoryCopy } from '../../data/listingForm';
import { useCategorySelection } from '../../hooks/listing-form/useCategorySelection';

interface CategorySelectSectionProps {
  readonly step: number;
  readonly mainCategory: string;
  readonly subCategory: string;
  readonly onMainChange: (value: string) => void;
  readonly onSubChange: (value: string) => void;
}

/** Create section 3 — main/sub category selects (sub list follows main). */
export const CategorySelectSection: React.FC<CategorySelectSectionProps> = ({
  step,
  mainCategory,
  subCategory,
  onMainChange,
  onSubChange,
}) => {
  const { mainOptions, subOptions } = useCategorySelection(mainCategory, subCategory);
  return (
    // data-component="CategorySelector"
    <SectionCard
      inlineHint={<span className="font-caption text-caption text-muted">{categoryCopy.hint}</span>}
      step={step}
      title={categoryCopy.title}
      variant="create"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
        <SelectField label={categoryCopy.mainLabel} onChange={onMainChange} options={mainOptions} value={mainCategory} />
        <SelectField label={categoryCopy.subLabel} onChange={onSubChange} options={subOptions} value={subCategory} />
      </div>
    </SectionCard>
  );
};

export default CategorySelectSection;
