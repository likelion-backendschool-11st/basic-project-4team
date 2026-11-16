import React from 'react';
import { findIdCopy } from '../../data/auth';
import { ROUTES } from '../../data/layout';
import { AuthSecondaryAction } from './AuthSecondaryAction';
import { FormField } from './FormField';
import { SubmitButton } from './SubmitButton';

interface FindIdFormProps {
  readonly email: string;
  readonly emailError?: string;
  readonly submitting: boolean;
  readonly onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readonly onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

/* data-component="FindIdForm" — 확인: 메일 발송, 취소: 로그인 화면 (REQ-LOGIN-004) */
export const FindIdForm: React.FC<FindIdFormProps> = ({ email, emailError, submitting, onEmailChange, onSubmit }) => (
  <form className="space-y-5" id="findIdForm" noValidate onSubmit={onSubmit}>
    <FormField
      autoComplete="email"
      errorText={emailError ?? ''}
      hasError={Boolean(emailError)}
      id="findIdEmail"
      label={findIdCopy.emailLabel}
      name="email"
      onChange={onEmailChange}
      placeholder={findIdCopy.emailPlaceholder}
      type="email"
      value={email}
    />
    <div className="grid grid-cols-2 gap-3 pt-2">
      <AuthSecondaryAction label={findIdCopy.cancel} to={ROUTES.login} />
      <SubmitButton label={findIdCopy.submit} loading={submitting} loadingLabel={findIdCopy.submitting} />
    </div>
  </form>
);

export default FindIdForm;
