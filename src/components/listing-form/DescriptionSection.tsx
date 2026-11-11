import React from 'react';
import { DescriptionCounter, DescriptionField } from './DescriptionField';
import { SectionCard } from './SectionCard';
import { MAX_DESCRIPTION, descriptionCopy } from '../../data/listingForm';

interface DescriptionSectionProps {
  readonly step: number;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly error?: string;
}

/** Create section 7 — detailed description. */
export const DescriptionSection: React.FC<DescriptionSectionProps> = ({ step, value, onChange, error }) => (
  // data-component="DescriptionSection"
  <SectionCard
    right={
      <DescriptionCounter
        length={value.length}
        over={value.length > MAX_DESCRIPTION}
        suffix={descriptionCopy.create.counterSuffix}
        variant="create"
      />
    }
    step={step}
    title={descriptionCopy.create.title}
    variant="create"
  >
    <DescriptionField error={error} onChange={onChange} showLabel={false} value={value} variant="create" />
  </SectionCard>
);

export default DescriptionSection;
