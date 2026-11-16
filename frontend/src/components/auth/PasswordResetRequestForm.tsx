import React from 'react';
import { findPasswordCopy } from '../../data/auth';
import { ROUTES } from '../../data/layout';
import type { FieldErrors } from '../../hooks/auth/authFormHelpers';
import type { FindPasswordField, FindPasswordValues } from '../../hooks/auth/useFindPasswordForm';
import { AuthSecondaryAction } from './AuthSecondaryAction';
import { FormField } from './FormField';
import { SubmitButton } from './SubmitButton';

interface PasswordResetRequestFormProps {
  readonly values: FindPasswordValues;
  readonly errors: FieldErrors<FindPasswordField>;
  readonly submitting: boolean;
  readonly onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readonly onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

/* data-component="PasswordResetRequestForm" — 비밀번호 찾기 1단계: 아이디·이메일 */
export const PasswordResetRequestForm: React.FC<PasswordResetRequestFormProps> = ({
  values,
  errors,
  submitting,
  onChange,
  onSubmit,
}) => (
  <form className="space-y-5" id="passwordResetRequestForm" noValidate onSubmit={onSubmit}>
    <FormField
      autoComplete="username"
      errorText={errors.loginId ?? ''}
      hasError={Boolean(errors.loginId)}
      id="resetLoginId"
      label={findPasswordCopy.loginIdLabel}
      name="loginId"
      onChange={onChange}
      placeholder={findPasswordCopy.loginIdPlaceholder}
      type="text"
      value={values.loginId}
    />
    <FormField
      autoComplete="email"
      errorText={errors.email ?? ''}
      hasError={Boolean(errors.email)}
      id="resetEmail"
      label={findPasswordCopy.emailLabel}
      name="email"
      onChange={onChange}
      placeholder={findPasswordCopy.emailPlaceholder}
      type="email"
      value={values.email}
    />
    <div className="grid grid-cols-2 gap-3 pt-2">
      <AuthSecondaryAction label={findPasswordCopy.cancel} to={ROUTES.login} />
      <SubmitButton
        label={findPasswordCopy.requestSubmit}
        loading={submitting}
        loadingLabel={findPasswordCopy.requestSubmitting}
      />
    </div>
  </form>
);

export default PasswordResetRequestForm;
