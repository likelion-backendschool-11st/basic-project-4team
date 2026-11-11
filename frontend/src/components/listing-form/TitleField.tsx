import React, { useId } from 'react';
import { pricingCopy, type FormVariant } from '../../data/listingForm';

interface TitleFieldProps {
  readonly variant: FormVariant;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly error?: string;
}

/** Listing title input. */
export const TitleField: React.FC<TitleFieldProps> = ({ variant, value, onChange, error }) => {
  const id = useId();
  if (variant === 'create') {
    return (
      <div className="flex flex-col gap-space-xs">
        <label className="font-caption text-caption text-body" htmlFor={id}>
          {pricingCopy.create.titleLabel}
        </label>
        <input
          className="w-full bg-canvas-soft border-0 font-body-md text-body-md text-ink px-space-md py-2.5 rounded focus:outline-none focus:ring-0 focus:bg-canvas placeholder:text-faint"
          id={id}
          onChange={(e) => onChange(e.target.value)}
          placeholder={pricingCopy.create.titlePlaceholder}
          type="text"
          value={value}
        />
        {error && <p className="font-caption text-caption text-error">{error}</p>}
      </div>
    );
  }
  return (
    // data-component="TitleInput"
    <div>
      <label className="block font-caption text-caption text-ink font-bold mb-1" htmlFor={id}>
        {pricingCopy.edit.titleLabel}
      </label>
      <input
        className="w-full bg-canvas border border-hairline-strong rounded px-space-sm py-2 font-ui-label text-ui-label text-ink focus:border-primary focus:outline-none focus:ring-0"
        id={id}
        onChange={(e) => onChange(e.target.value)}
        type="text"
        value={value}
      />
      {error ? (
        <p className="font-micro text-micro text-error mt-1">{error}</p>
      ) : (
        <p className="font-micro text-micro text-muted mt-1">{pricingCopy.edit.titleHelp}</p>
      )}
    </div>
  );
};

export default TitleField;
