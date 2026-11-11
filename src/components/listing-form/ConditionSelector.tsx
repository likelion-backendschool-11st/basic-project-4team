import React from 'react';
import { conditionOptions, type FormVariant, type ItemCondition } from '../../data/listingForm';

interface ConditionSelectorProps {
  readonly variant: FormVariant;
  readonly value: ItemCondition;
  readonly onChange: (value: ItemCondition) => void;
  /** Subset of options to show (edit shows sealed vs graded only). */
  readonly visible?: readonly ItemCondition[];
  readonly disabledValues?: readonly ItemCondition[];
}

/** Radio group for storage / grading condition. */
export const ConditionSelector: React.FC<ConditionSelectorProps> = ({ variant, value, onChange, visible, disabledValues = [] }) => {
  const isCreate = variant === 'create';
  const options = visible ? conditionOptions.filter((o) => visible.includes(o.value)) : conditionOptions;
  const name = `item_condition_status_${variant}`;
  return (
    <div className={`flex flex-wrap items-center py-1 ${isCreate ? 'gap-space-md' : 'gap-space-md'}`} role="radiogroup">
      {options.map((o) => {
        const checked = o.value === value;
        const disabled = disabledValues.includes(o.value);
        return (
          <label
            className={`${isCreate ? 'flex' : 'inline-flex'} items-center gap-1.5 font-ui-sm text-ui-sm ${
              disabled ? 'text-muted cursor-not-allowed' : 'text-ink cursor-pointer'
            } ${!isCreate && checked ? 'font-bold' : ''}`}
            key={o.value}
          >
            <input
              checked={checked}
              className={`accent-primary text-primary focus:ring-primary ${isCreate ? 'w-4 h-4' : ''}`}
              disabled={disabled}
              name={name}
              onChange={() => onChange(o.value)}
              type="radio"
              value={o.value}
            />
            <span className={isCreate && checked ? 'font-bold text-primary-container' : ''}>
              {isCreate ? o.label : o.shortLabel}
            </span>
          </label>
        );
      })}
    </div>
  );
};

export default ConditionSelector;
