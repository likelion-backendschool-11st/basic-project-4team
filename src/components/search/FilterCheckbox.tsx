import React from 'react';

export type FilterCheckboxSize = 'md' | 'sm';

interface FilterCheckboxProps {
  readonly label: string;
  readonly checked: boolean;
  readonly onToggle?: () => void;
  readonly disabled?: boolean;
  readonly size?: FilterCheckboxSize;
  readonly highlighted?: boolean;
}

/** Native checkbox + label styled like the Stitch filter options. */
export const FilterCheckbox: React.FC<FilterCheckboxProps> = ({
  label,
  checked,
  onToggle,
  disabled = false,
  size = 'md',
  highlighted = false,
}) => {
  if (disabled) {
    return (
      <label className="flex items-center gap-1.5 cursor-not-allowed text-muted font-ui-sm text-ui-sm select-none">
        <input checked={false} className="w-4 h-4 rounded cursor-not-allowed" disabled readOnly type="checkbox" />
        <span>{label}</span>
      </label>
    );
  }

  const labelClass = highlighted
    ? 'flex items-center gap-1.5 cursor-pointer text-ink font-ui-label text-ui-label select-none bg-mint-50 px-2 py-1 rounded'
    : `flex items-center ${size === 'sm' ? 'gap-1' : 'gap-1.5'} cursor-pointer text-ink font-ui-sm text-ui-sm select-none`;
  const inputClass =
    size === 'sm'
      ? 'w-3.5 h-3.5 rounded text-primary-container accent-primary-container'
      : 'w-4 h-4 rounded text-primary-container focus:ring-0 cursor-pointer accent-primary-container';

  return (
    <label className={labelClass}>
      <input checked={checked} className={inputClass} onChange={onToggle} type="checkbox" />
      <span className={highlighted ? 'text-forest font-bold' : undefined}>{label}</span>
    </label>
  );
};

export default FilterCheckbox;
