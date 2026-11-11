import React, { useId } from 'react';
import { Icon } from '../common/Icon';
import type { SelectOption } from '../../data/listingForm';

export type SelectFieldTone = 'soft' | 'white' | 'compact';

interface SelectFieldProps {
  readonly label?: string;
  readonly value: string;
  readonly options: readonly SelectOption[];
  readonly onChange: (value: string) => void;
  /** soft = canvas-soft fill (create), white = canvas fill (create attrs), compact = bordered (edit). */
  readonly tone?: SelectFieldTone;
  readonly useShortLabel?: boolean;
  readonly emphasize?: boolean;
  readonly disabled?: boolean;
  readonly className?: string;
}

const toneClass: Record<SelectFieldTone, string> = {
  soft: 'bg-canvas-soft font-ui-label text-ui-label px-space-sm py-2.5 focus:bg-canvas',
  white: 'bg-canvas font-ui-label text-ui-label px-space-sm py-2',
  compact:
    'bg-canvas border border-hairline-strong px-2 py-1.5 font-ui-sm text-ui-sm focus:border-primary disabled:bg-canvas-soft disabled:text-muted',
};

/** Labelled select. Create tones hide the native arrow and render the expand_more glyph. */
export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  options,
  onChange,
  tone = 'soft',
  useShortLabel = false,
  emphasize = false,
  disabled = false,
  className = '',
}) => {
  const id = useId();
  const isCompact = tone === 'compact';
  return (
    <div className={`flex flex-col gap-1 min-w-0 ${className}`}>
      {label && (
        <label
          className={isCompact ? 'block font-micro text-micro text-muted' : 'font-caption text-caption text-body'}
          htmlFor={id}
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={`w-full rounded focus:outline-none focus:ring-0 ${toneClass[tone]} ${
            isCompact ? '' : 'appearance-none bg-none border-0 pr-10'
          } ${emphasize ? 'font-bold text-forest' : 'text-ink'}`}
          disabled={disabled}
          id={id}
          onChange={(e) => onChange(e.target.value)}
          value={value}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {useShortLabel ? (o.shortLabel ?? o.label) : o.label}
            </option>
          ))}
        </select>
        {!isCompact && (
          <Icon
            className={`absolute right-3 ${tone === 'soft' ? 'top-2.5' : 'top-2'} text-muted pointer-events-none text-[20px]`}
            name="expand_more"
          />
        )}
      </div>
    </div>
  );
};

export default SelectField;
