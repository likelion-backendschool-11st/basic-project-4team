import React, { useId } from 'react';

interface TextFieldProps {
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder?: string;
  /** white = borderless canvas input (create attrs), compact = bordered small input (edit attrs). */
  readonly tone?: 'white' | 'compact';
}

/** Small labelled text input used in the attribute panels. */
export const TextField: React.FC<TextFieldProps> = ({ label, value, onChange, placeholder, tone = 'white' }) => {
  const id = useId();
  const isCompact = tone === 'compact';
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <label
        className={isCompact ? 'block font-micro text-micro text-muted' : 'font-caption text-caption text-body'}
        htmlFor={id}
      >
        {label}
      </label>
      <input
        className={
          isCompact
            ? 'w-full bg-canvas border border-hairline-strong rounded px-2.5 py-1.5 font-ui-sm text-ui-sm text-ink focus:border-primary focus:outline-none focus:ring-0'
            : 'bg-canvas border-0 font-body-sm text-body-sm text-ink px-space-sm py-2 rounded focus:outline-none focus:ring-0 placeholder:text-faint'
        }
        id={id}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type="text"
        value={value}
      />
    </div>
  );
};

export default TextField;
