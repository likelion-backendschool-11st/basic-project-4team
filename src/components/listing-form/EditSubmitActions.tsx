import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../common/Icon';
import { FormErrorSummary } from './FormErrorSummary';
import { submitCopy } from '../../data/listingForm';

interface EditSubmitActionsProps {
  readonly cancelTo: string;
  readonly submitting: boolean;
  readonly errors: readonly string[];
  readonly onDelete: () => void;
}

/** Edit-only action row: delete / cancel / save. */
export const EditSubmitActions: React.FC<EditSubmitActionsProps> = ({ cancelTo, submitting, errors, onDelete }) => {
  const c = submitCopy.edit;
  return (
    // data-component="SubmitActions"
    <div className="flex flex-col gap-space-sm pt-space-xs">
      <FormErrorSummary messages={errors} />
      <div className="flex flex-col sm:flex-row items-center justify-between gap-space-md">
        <button
          className="w-full sm:w-auto px-space-md py-3 rounded border border-hairline-strong text-error hover:bg-error-container/20 font-ui-label text-ui-label transition-colors flex items-center justify-center gap-1"
          onClick={onDelete}
          type="button"
        >
          <Icon className="text-[18px]" name="delete" />
          {c.delete}
        </button>
        <div className="flex items-center gap-space-sm w-full sm:w-auto">
          <Link
            className="w-1/2 sm:w-auto px-space-lg py-3 rounded border border-hairline-strong text-body hover:bg-canvas-soft font-ui-label text-ui-label text-center transition-colors"
            to={cancelTo}
          >
            {c.cancel}
          </Link>
          <button
            className="w-1/2 sm:w-auto px-space-xxl py-3 rounded bg-primary-container text-on-primary font-ui-label text-ui-label hover:bg-forest disabled:opacity-70 transition-colors shadow-sm flex items-center justify-center gap-1.5 whitespace-nowrap"
            disabled={submitting}
            type="submit"
          >
            <Icon className={`text-[18px] ${submitting ? 'animate-spin' : ''}`} name={submitting ? 'refresh' : 'done_all'} />
            {submitting ? c.submitting : c.submit}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditSubmitActions;
