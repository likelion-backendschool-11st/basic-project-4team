import React from 'react';

interface CheckboxFieldProps {
  readonly checked: boolean;
  readonly onChange: (checked: boolean) => void;
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly inputClassName?: string;
}

/** Checkbox + label row (accent-primary). */
export const CheckboxField: React.FC<CheckboxFieldProps> = ({ checked, onChange, children, className = '', inputClassName = '' }) => (
  <label className={`cursor-pointer ${className}`}>
    <input
      checked={checked}
      className={`w-4 h-4 accent-primary text-primary rounded focus:ring-primary shrink-0 ${inputClassName}`}
      onChange={(e) => onChange(e.target.checked)}
      type="checkbox"
    />
    {children}
  </label>
);

export default CheckboxField;
