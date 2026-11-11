import React from 'react';

interface SubmitButtonProps {
  readonly label: string;
  readonly loadingLabel: string;
  readonly loading: boolean;
}

/* data-component="SubmitButton" */
export const SubmitButton: React.FC<SubmitButtonProps> = ({ label, loadingLabel, loading }) => (
  <button
    className="w-full bg-primary-container hover:bg-primary-deep active:bg-primary-deep text-on-primary font-bold py-3.5 px-4 rounded text-base transition-colors duration-150 flex items-center justify-center shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-container disabled:opacity-80"
    disabled={loading}
    type="submit"
  >
    <span>{loading ? loadingLabel : label}</span>
    {loading && (
      <svg className="animate-spin ml-2 h-5 w-5 text-on-primary" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path
          className="opacity-75"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          fill="currentColor"
        />
      </svg>
    )}
  </button>
);

export default SubmitButton;
