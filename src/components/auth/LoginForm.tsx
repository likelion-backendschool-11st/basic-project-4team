import React from 'react';
import { loginCopy } from '../../data/auth';
import type { LoginFieldErrors } from '../../hooks/auth/useLoginForm';
import { FormField } from './FormField';
import { LoginOptionsRow } from './LoginOptionsRow';
import { PasswordToggleButton } from './PasswordToggleButton';
import { SubmitButton } from './SubmitButton';

interface LoginFormProps {
  readonly userId: string;
  readonly password: string;
  readonly rememberId: boolean;
  readonly showPassword: boolean;
  readonly submitting: boolean;
  readonly errors: LoginFieldErrors;
  readonly onUserIdChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readonly onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readonly onRememberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readonly onTogglePassword: () => void;
  readonly onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

/* data-component="LoginForm" */
export const LoginForm: React.FC<LoginFormProps> = ({
  userId,
  password,
  rememberId,
  showPassword,
  submitting,
  errors,
  onUserIdChange,
  onPasswordChange,
  onRememberChange,
  onTogglePassword,
  onSubmit,
}) => (
  <form className="space-y-5" id="loginForm" noValidate onSubmit={onSubmit}>
    <FormField
      autoComplete="username"
      errorText={loginCopy.idError}
      hasError={errors.userId}
      id="userId"
      label={loginCopy.idLabel}
      name="userId"
      onChange={onUserIdChange}
      placeholder={loginCopy.idPlaceholder}
      type="text"
      value={userId}
    />
    <FormField
      autoComplete="current-password"
      errorText={loginCopy.passwordError}
      hasError={errors.password}
      id="password"
      label={loginCopy.passwordLabel}
      name="password"
      onChange={onPasswordChange}
      placeholder={loginCopy.passwordPlaceholder}
      trailing={
        <PasswordToggleButton label={loginCopy.passwordToggleLabel} onToggle={onTogglePassword} visible={showPassword} />
      }
      type={showPassword ? 'text' : 'password'}
      value={password}
    />
    <LoginOptionsRow
      onRememberChange={onRememberChange}
      remember={rememberId}
      rememberLabel={loginCopy.rememberId}
      secureLabel={loginCopy.secureBadge}
    />
    <div className="pt-2">
      <SubmitButton label={loginCopy.submit} loading={submitting} loadingLabel={loginCopy.submitting} />
    </div>
  </form>
);

export default LoginForm;
