import React from 'react';
import { DescriptionField } from './DescriptionField';
import { PriceField } from './PriceField';
import { SectionCard } from './SectionCard';
import { TitleField } from './TitleField';
import { pricingCopy } from '../../data/listingForm';

interface EditableFieldsSectionProps {
  readonly step: number;
  readonly title: string;
  readonly price: number;
  readonly description: string;
  readonly originalPrice: number;
  readonly wishCount: number;
  readonly onTitleChange: (value: string) => void;
  readonly onPriceChange: (value: number) => void;
  readonly onAddPrice: (amount: number) => void;
  readonly onDescriptionChange: (value: string) => void;
  readonly titleError?: string;
  readonly priceError?: string;
  readonly descriptionError?: string;
}

/** Edit section 3 — title, price and description in one card. */
export const EditableFieldsSection: React.FC<EditableFieldsSectionProps> = (props) => (
  // data-component="EditableFieldsSection"
  <SectionCard
    right={<span className="font-caption text-caption text-muted">{pricingCopy.edit.hint}</span>}
    step={props.step}
    title={pricingCopy.edit.title}
    variant="edit"
  >
    <TitleField error={props.titleError} onChange={props.onTitleChange} value={props.title} variant="edit" />
    <PriceField
      error={props.priceError}
      onAdd={props.onAddPrice}
      onChange={props.onPriceChange}
      originalPrice={props.originalPrice}
      value={props.price}
      variant="edit"
      wishCount={props.wishCount}
    />
    <DescriptionField error={props.descriptionError} onChange={props.onDescriptionChange} value={props.description} variant="edit" />
  </SectionCard>
);

export default EditableFieldsSection;
