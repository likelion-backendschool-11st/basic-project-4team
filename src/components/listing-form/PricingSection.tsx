import React from 'react';
import { PriceField } from './PriceField';
import { SectionCard } from './SectionCard';
import { TitleField } from './TitleField';
import { pricingCopy } from '../../data/listingForm';

interface PricingSectionProps {
  readonly step: number;
  readonly title: string;
  readonly price: number;
  readonly onTitleChange: (value: string) => void;
  readonly onPriceChange: (value: number) => void;
  readonly onAddPrice: (amount: number) => void;
  readonly titleError?: string;
  readonly priceError?: string;
}

/** Create section 6 — title, price and market feedback. */
export const PricingSection: React.FC<PricingSectionProps> = ({
  step,
  title,
  price,
  onTitleChange,
  onPriceChange,
  onAddPrice,
  titleError,
  priceError,
}) => (
  // data-component="ListingPricingSection"
  <SectionCard step={step} title={pricingCopy.create.title} variant="create">
    <TitleField error={titleError} onChange={onTitleChange} value={title} variant="create" />
    <PriceField error={priceError} onAdd={onAddPrice} onChange={onPriceChange} value={price} variant="create" />
  </SectionCard>
);

export default PricingSection;
