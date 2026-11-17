import React, { useId } from 'react';

interface TextFieldProps {
  readonly label: string;
  readonly value: string;
  /** readOnly면 생략할 수 있다. */
  readonly onChange?: (value: string) => void;
  readonly placeholder?: string;
  /** white = borderless canvas input (create attrs), compact = bordered small input (edit attrs). */
  readonly tone?: 'white' | 'compact';
  /** 품목에서 자동으로 채우는 값처럼 사용자가 바꿀 수 없는 칸. */
  readonly readOnly?: boolean;
}

/** Small labelled text input used in the attribute panels. */
export const TextField: React.FC<TextFieldProps> = ({ label, value, onChange, placeholder, tone = 'white', readOnly = false }) => {
  const id = useId();
  const isCompact = tone === 'compact';
  const readOnlyClass = readOnly ? 'cursor-default text-body' : 'text-ink';
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <label
        className={isCompact ? 'block font-micro text-micro text-muted' : 'font-caption text-caption text-body'}
        htmlFor={id}
      >
        {label}
      </label>
      <input
        className={`${
          isCompact
            ? `w-full border border-hairline-strong rounded px-2.5 py-1.5 font-ui-sm text-ui-sm focus:border-primary focus:outline-none focus:ring-0 ${
                readOnly ? 'bg-canvas-soft' : 'bg-canvas'
              }`
            : 'bg-canvas border-0 font-body-sm text-body-sm px-space-sm py-2 rounded focus:outline-none focus:ring-0 placeholder:text-faint'
        } ${readOnlyClass}`}
        id={id}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        type="text"
        value={value}
      />
    </div>
  );
};

export default TextField;
