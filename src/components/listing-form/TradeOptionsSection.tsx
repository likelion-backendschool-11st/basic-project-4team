import React from 'react';
import { CheckboxField } from './CheckboxField';
import { DirectLocationInput } from './DirectLocationInput';
import { SectionCard } from './SectionCard';
import { tradeCopy, type FormVariant } from '../../data/listingForm';

interface TradeOptionsSectionProps {
  readonly variant: FormVariant;
  readonly step: number;
  readonly delivery: boolean;
  readonly direct: boolean;
  readonly directLocation: string;
  readonly agreed: boolean;
  readonly onDeliveryChange: (v: boolean) => void;
  readonly onDirectChange: (v: boolean) => void;
  readonly onLocationChange: (v: string) => void;
  readonly onAgreedChange: (v: boolean) => void;
  readonly errors?: readonly string[];
}

/** Trade method checkboxes, meet-up area and the required seller agreement. */
export const TradeOptionsSection: React.FC<TradeOptionsSectionProps> = ({
  variant,
  step,
  delivery,
  direct,
  directLocation,
  agreed,
  onDeliveryChange,
  onDirectChange,
  onLocationChange,
  onAgreedChange,
  errors = [],
}) => {
  const isCreate = variant === 'create';
  const copy = isCreate ? tradeCopy.create : tradeCopy.edit;
  const errorList = errors.length > 0 && (
    <ul className="font-caption text-caption text-error">
      {errors.map((e) => (
        <li key={e}>{e}</li>
      ))}
    </ul>
  );

  const methods = (
    <div className={isCreate ? 'flex flex-wrap items-center gap-space-lg' : 'flex flex-col sm:flex-row sm:items-center gap-space-md'}>
      <CheckboxField
        checked={delivery}
        className={`flex items-center gap-2 ${isCreate ? 'font-ui-label text-ui-label' : 'font-ui-sm text-ui-sm'} text-ink`}
        onChange={onDeliveryChange}
      >
        <span>{copy.delivery}</span>
      </CheckboxField>
      <CheckboxField
        checked={direct}
        className={`flex items-center gap-2 ${isCreate ? 'font-ui-label text-ui-label' : 'font-ui-sm text-ui-sm'} text-ink`}
        onChange={onDirectChange}
      >
        <span>{copy.direct}</span>
      </CheckboxField>
    </div>
  );

  const agreement = (
    <CheckboxField checked={agreed} className="flex items-start gap-2.5" inputClassName="mt-0.5" onChange={onAgreedChange}>
      <span className={isCreate ? 'font-body-sm text-body-sm text-body' : 'font-caption text-caption text-body'}>
        <strong className="text-ink">{copy.agreeStrong}</strong>
        {copy.agree}
      </span>
    </CheckboxField>
  );

  if (isCreate) {
    return (
      // data-component="TradeOptionsSection"
      <SectionCard step={step} title={copy.title} variant="create">
        <div className="flex flex-col gap-space-sm bg-canvas-soft p-space-md rounded">
          {methods}
          {direct && <DirectLocationInput onChange={onLocationChange} value={directLocation} variant="create" />}
        </div>
        <div className="pt-space-xs">{agreement}</div>
        {errorList}
      </SectionCard>
    );
  }

  return (
    // data-component="TradeOptions"
    <SectionCard step={step} title={copy.title} variant="edit">
      <div className="space-y-space-sm">
        {methods}
        {direct && <DirectLocationInput onChange={onLocationChange} value={directLocation} variant="edit" />}
        {/* data-component="ConsentCheckbox" */}
        <div className="p-space-sm bg-canvas-soft border border-hairline rounded mt-space-sm">{agreement}</div>
        {errorList}
      </div>
    </SectionCard>
  );
};

export default TradeOptionsSection;
