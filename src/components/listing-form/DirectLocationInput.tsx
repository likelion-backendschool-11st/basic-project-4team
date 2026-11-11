import React from 'react';
import { Icon } from '../common/Icon';
import { tradeCopy, type FormVariant } from '../../data/listingForm';

interface DirectLocationInputProps {
  readonly variant: FormVariant;
  readonly value: string;
  readonly onChange: (value: string) => void;
}

/** Preferred meet-up area input (shown when 직거래 is checked). */
export const DirectLocationInput: React.FC<DirectLocationInputProps> = ({ variant, value, onChange }) => {
  const copy = variant === 'create' ? tradeCopy.create : tradeCopy.edit;
  if (variant === 'create') {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center gap-space-xs sm:gap-space-sm mt-1 bg-canvas p-space-xs rounded">
        <span className="font-caption text-caption text-muted shrink-0 pl-2">{copy.locationLabel}</span>
        <div className="flex items-center bg-canvas-soft px-space-sm py-1.5 rounded flex-1">
          <input
            aria-label={copy.locationLabel}
            className="w-full bg-transparent border-0 p-0 font-ui-sm text-ui-sm text-ink focus:outline-none focus:ring-0 placeholder:text-faint"
            onChange={(e) => onChange(e.target.value)}
            placeholder={tradeCopy.locationPlaceholder}
            type="text"
            value={value}
          />
          <button aria-label={tradeCopy.locationSearchLabel} className="flex items-center text-primary-container hover:text-forest" type="button">
            <Icon className="text-[18px]" name="search" />
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-space-xs max-w-md pt-space-xs">
      <span className="font-caption text-caption text-muted shrink-0">{copy.locationLabel}</span>
      <div className="relative flex-1">
        <input
          aria-label={copy.locationLabel}
          className="w-full bg-canvas border border-hairline-strong rounded pl-2.5 pr-8 py-1.5 font-ui-sm text-ui-sm text-ink focus:border-primary focus:outline-none focus:ring-0"
          onChange={(e) => onChange(e.target.value)}
          placeholder={tradeCopy.locationPlaceholder}
          type="text"
          value={value}
        />
        <button className="text-outline hover:text-ink absolute right-2 top-1.5" title={tradeCopy.locationSearchLabel} type="button">
          <Icon className="text-[18px]" name="search" />
        </button>
      </div>
    </div>
  );
};

export default DirectLocationInput;
