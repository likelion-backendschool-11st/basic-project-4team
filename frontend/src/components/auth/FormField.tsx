import React from 'react';

interface FormFieldProps {
  readonly id: string;
  readonly name: string;
  readonly label: string;
  readonly type: 'text' | 'password' | 'email';
  readonly value: string;
  readonly placeholder: string;
  readonly autoComplete: string;
  readonly hasError: boolean;
  readonly errorText: string;
  readonly onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Optional trailing control rendered inside the input (e.g. password visibility toggle). */
  readonly trailing?: React.ReactNode;
  /** 에러가 없을 때 입력칸 아래에 보여줄 도움말. */
  readonly hint?: string;
  readonly inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  readonly maxLength?: number;
}

/* data-component="FormField" */
export const FormField: React.FC<FormFieldProps> = ({
  id,
  name,
  label,
  type,
  value,
  placeholder,
  autoComplete,
  hasError,
  errorText,
  onChange,
  trailing,
  hint,
  inputMode,
  maxLength,
}) => (
  <div data-field-name={name}>
    <label className="block font-caption text-caption font-bold text-ink tracking-wider uppercase mb-1.5" htmlFor={id}>
      {label}
    </label>
    <div className="relative">
      <input
        aria-invalid={hasError}
        autoComplete={autoComplete}
        className={`w-full px-3.5 py-3 ${trailing ? 'pr-10' : ''} text-sm text-ink placeholder:text-muted/60 bg-canvas border rounded transition-colors focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container ${
          hasError ? 'border-error' : 'border-hairline-strong'
        }`}
        id={id}
        inputMode={inputMode}
        maxLength={maxLength}
        name={name}
        onChange={onChange}
        placeholder={placeholder}
        required
        type={type}
        value={value}
      />
      {trailing}
    </div>
    {hasError && <span className="block font-caption text-caption text-error mt-1">{errorText}</span>}
    {!hasError && hint && <span className="block font-caption text-caption text-muted mt-1">{hint}</span>}
  </div>
);

export default FormField;
