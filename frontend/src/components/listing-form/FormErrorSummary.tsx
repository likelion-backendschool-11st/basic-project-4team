import React from 'react';
import { Icon } from '../common/Icon';

interface FormErrorSummaryProps {
  readonly messages: readonly string[];
}

/** Collected validation errors shown above the submit action. */
export const FormErrorSummary: React.FC<FormErrorSummaryProps> = ({ messages }) => {
  if (messages.length === 0) return null;
  return (
    <div className="bg-error-container text-on-error-container p-space-sm rounded flex items-start gap-2" role="alert">
      <Icon className="text-[18px] text-error shrink-0 mt-0.5" name="error" />
      <ul className="font-caption text-caption leading-relaxed list-disc pl-4">
        {messages.map((m) => (
          <li key={m}>{m}</li>
        ))}
      </ul>
    </div>
  );
};

export default FormErrorSummary;
