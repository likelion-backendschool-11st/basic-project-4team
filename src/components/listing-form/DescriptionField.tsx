import React, { useId } from 'react';
import { MAX_DESCRIPTION, descriptionCopy, type FormVariant } from '../../data/listingForm';

interface DescriptionFieldProps {
  readonly variant: FormVariant;
  readonly value: string;
  readonly onChange: (value: string) => void;
  /** Create renders the header inside its own SectionCard, so it hides the inline label. */
  readonly showLabel?: boolean;
  readonly error?: string;
}

/** Detailed description textarea with live character counter. */
export const DescriptionField: React.FC<DescriptionFieldProps> = ({ variant, value, onChange, showLabel = true, error }) => {
  const id = useId();
  const isCreate = variant === 'create';
  const copy = isCreate ? descriptionCopy.create : descriptionCopy.edit;
  const over = value.length > MAX_DESCRIPTION;
  return (
    // data-component="DescriptionTextarea"
    <div>
      {showLabel && (
        <div className="flex items-center justify-between mb-1">
          <label className="font-caption text-caption text-ink font-bold" htmlFor={id}>
            {copy.title}
          </label>
          <DescriptionCounter length={value.length} suffix={copy.counterSuffix} over={over} variant={variant} />
        </div>
      )}
      <textarea
        aria-label={copy.title}
        className={
          isCreate
            ? 'w-full bg-canvas-soft border-0 font-body-sm text-body-sm text-ink p-space-md rounded focus:outline-none focus:ring-0 focus:bg-canvas leading-relaxed placeholder:text-faint'
            : 'w-full bg-canvas border border-hairline-strong rounded p-space-sm font-body-sm text-body-sm text-ink focus:border-primary focus:outline-none focus:ring-0 leading-relaxed'
        }
        id={id}
        onChange={(e) => onChange(e.target.value)}
        placeholder={descriptionCopy.placeholder}
        rows={6}
        value={value}
      />
      {error && <p className="font-caption text-caption text-error mt-1">{error}</p>}
    </div>
  );
};

interface DescriptionCounterProps {
  readonly variant: FormVariant;
  readonly length: number;
  readonly suffix: string;
  readonly over: boolean;
}

/** "148 / 1000자" counter. */
export const DescriptionCounter: React.FC<DescriptionCounterProps> = ({ variant, length, suffix, over }) => (
  <span
    className={`${variant === 'create' ? 'font-caption text-caption' : 'font-micro text-micro'} ${over ? 'text-error' : 'text-muted'}`}
  >
    {`${length.toLocaleString('ko-KR')}${suffix}`}
  </span>
);

export default DescriptionField;
