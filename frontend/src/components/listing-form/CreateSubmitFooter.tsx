import React from 'react';
import { Icon } from '../common/Icon';
import { FormErrorSummary } from './FormErrorSummary';
import { submitCopy } from '../../data/listingForm';

interface CreateSubmitFooterProps {
  readonly submitting: boolean;
  readonly errors: readonly string[];
}

/** Create-mode full-width submit button + promo note. */
export const CreateSubmitFooter: React.FC<CreateSubmitFooterProps> = ({ submitting, errors }) => (
  // data-component="SubmitActionFooter"
  <div className="pt-space-sm pb-space-xxl flex flex-col gap-space-sm">
    <FormErrorSummary messages={errors} />
    <div>
      <button
        className="w-full py-4 bg-primary-container hover:bg-forest disabled:opacity-70 text-on-primary font-ui-label text-ui-label text-[18px] rounded transition-all flex items-center justify-center gap-2 shadow-sm"
        disabled={submitting}
        type="submit"
      >
        <Icon className={`text-[24px] ${submitting ? 'animate-spin' : ''}`} name={submitting ? 'refresh' : 'verified'} />
        <span>{submitting ? submitCopy.create.submitting : submitCopy.create.label}</span>
      </button>
      <p className="text-center font-caption text-caption text-muted mt-2">{submitCopy.create.promo}</p>
    </div>
  </div>
);

export default CreateSubmitFooter;
