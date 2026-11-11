import React from 'react';
import { AttributeFields } from './AttributeFields';
import { SectionCard } from './SectionCard';
import { attributesCopy, type ListingAttributes } from '../../data/listingForm';

interface AttributesSectionProps {
  readonly step: number;
  readonly value: ListingAttributes;
  readonly onChange: <K extends keyof ListingAttributes>(key: K, value: ListingAttributes[K]) => void;
}

/** Create section 5 — category-specific required attributes. */
export const AttributesSection: React.FC<AttributesSectionProps> = ({ step, value, onChange }) => (
  // data-component="CategoryAttributesForm"
  <SectionCard
    inlineHint={
      <span className="bg-mint-100 text-forest font-micro text-micro px-2 py-0.5 rounded">{attributesCopy.create.badge}</span>
    }
    right={<span className="font-caption text-caption text-muted">{attributesCopy.create.hint}</span>}
    step={step}
    title={attributesCopy.create.title}
    variant="create"
  >
    <AttributeFields onChange={onChange} value={value} variant="create" />
  </SectionCard>
);

export default AttributesSection;
