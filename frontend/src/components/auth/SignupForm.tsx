import React from 'react';
import { AUTH_RULES, signupCopy } from '../../data/auth';
import type { FieldErrors } from '../../hooks/auth/authFormHelpers';
import type { SignupField, SignupValues } from '../../hooks/auth/useSignupForm';
import { FormField } from './FormField';
import { PasswordToggleButton } from './PasswordToggleButton';
import { SubmitButton } from './SubmitButton';

interface SignupFormProps {
  readonly values: SignupValues;
  readonly errors: FieldErrors<SignupField>;
  readonly showPassword: boolean;
  readonly submitting: boolean;
  readonly onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readonly onTogglePassword: () => void;
  readonly onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

/* data-component="SignupForm" */
export const SignupForm: React.FC<SignupFormProps> = ({
  values,
  errors,
  showPassword,
  submitting,
  onChange,
  onTogglePassword,
  onSubmit,
}) => {
  const passwordType = showPassword ? 'text' : 'password';
  return (
    <form className="space-y-5" id="signupForm" noValidate onSubmit={onSubmit}>
      <FormField
        autoComplete="username"
        errorText={errors.loginId ?? ''}
        hasError={Boolean(errors.loginId)}
        id="signupLoginId"
        label={signupCopy.loginIdLabel}
        maxLength={30}
        name="loginId"
        onChange={onChange}
        placeholder={signupCopy.loginIdPlaceholder}
        type="text"
        value={values.loginId}
      />
      <FormField
        autoComplete="new-password"
        errorText={errors.password ?? ''}
        hasError={Boolean(errors.password)}
        id="signupPassword"
        label={signupCopy.passwordLabel}
        name="password"
        onChange={onChange}
        placeholder={signupCopy.passwordPlaceholder}
        trailing={<PasswordToggleButton label={signupCopy.passwordToggleLabel} onToggle={onTogglePassword} visible={showPassword} />}
        type={passwordType}
        value={values.password}
      />
      <FormField
        autoComplete="new-password"
        errorText={errors.passwordConfirm ?? ''}
        hasError={Boolean(errors.passwordConfirm)}
        id="signupPasswordConfirm"
        label={signupCopy.passwordConfirmLabel}
        name="passwordConfirm"
        onChange={onChange}
        placeholder={signupCopy.passwordConfirmPlaceholder}
        type={passwordType}
        value={values.passwordConfirm}
      />
      <FormField
        autoComplete="nickname"
        errorText={errors.nickname ?? ''}
        hasError={Boolean(errors.nickname)}
        id="signupNickname"
        label={signupCopy.nicknameLabel}
        maxLength={AUTH_RULES.nicknameMax}
        name="nickname"
        onChange={onChange}
        placeholder={signupCopy.nicknamePlaceholder}
        type="text"
        value={values.nickname}
      />
      <FormField
        autoComplete="email"
        errorText={errors.email ?? ''}
        hasError={Boolean(errors.email)}
        id="signupEmail"
        label={signupCopy.emailLabel}
        name="email"
        onChange={onChange}
        placeholder={signupCopy.emailPlaceholder}
        type="email"
        value={values.email}
      />
      <div className="pt-2">
        <SubmitButton label={signupCopy.submit} loading={submitting} loadingLabel={signupCopy.submitting} />
      </div>
    </form>
  );
};

export default SignupForm;
