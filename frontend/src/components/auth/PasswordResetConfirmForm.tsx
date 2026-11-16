import React from 'react';
import { findPasswordCopy } from '../../data/auth';
import type { FieldErrors } from '../../hooks/auth/authFormHelpers';
import type { FindPasswordField, FindPasswordValues } from '../../hooks/auth/useFindPasswordForm';
import { AuthSecondaryAction } from './AuthSecondaryAction';
import { FormField } from './FormField';
import { PasswordToggleButton } from './PasswordToggleButton';
import { SubmitButton } from './SubmitButton';

interface PasswordResetConfirmFormProps {
  readonly values: FindPasswordValues;
  readonly errors: FieldErrors<FindPasswordField>;
  readonly showPassword: boolean;
  readonly submitting: boolean;
  readonly resending: boolean;
  /** 0이면 바로 다시 받을 수 있다. */
  readonly resendIn: number;
  readonly onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readonly onTogglePassword: () => void;
  readonly onResend: () => void;
  readonly onBack: () => void;
  readonly onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

/* data-component="PasswordResetConfirmForm" — 비밀번호 찾기 2단계: 인증코드·새 비밀번호 */
export const PasswordResetConfirmForm: React.FC<PasswordResetConfirmFormProps> = ({
  values,
  errors,
  showPassword,
  submitting,
  resending,
  resendIn,
  onChange,
  onTogglePassword,
  onResend,
  onBack,
  onSubmit,
}) => {
  const passwordType = showPassword ? 'text' : 'password';
  return (
    <form className="space-y-5" id="passwordResetConfirmForm" noValidate onSubmit={onSubmit}>
      <FormField
        autoComplete="one-time-code"
        errorText={errors.code ?? ''}
        hasError={Boolean(errors.code)}
        id="resetCode"
        inputMode="numeric"
        label={findPasswordCopy.codeLabel}
        maxLength={6}
        name="code"
        onChange={onChange}
        placeholder={findPasswordCopy.codePlaceholder}
        type="text"
        value={values.code}
      />
      <FormField
        autoComplete="new-password"
        errorText={errors.newPassword ?? ''}
        hasError={Boolean(errors.newPassword)}
        id="resetNewPassword"
        label={findPasswordCopy.newPasswordLabel}
        name="newPassword"
        onChange={onChange}
        placeholder={findPasswordCopy.newPasswordPlaceholder}
        trailing={
          <PasswordToggleButton label={findPasswordCopy.passwordToggleLabel} onToggle={onTogglePassword} visible={showPassword} />
        }
        type={passwordType}
        value={values.newPassword}
      />
      <FormField
        autoComplete="new-password"
        errorText={errors.newPasswordConfirm ?? ''}
        hasError={Boolean(errors.newPasswordConfirm)}
        id="resetNewPasswordConfirm"
        label={findPasswordCopy.newPasswordConfirmLabel}
        name="newPasswordConfirm"
        onChange={onChange}
        placeholder={findPasswordCopy.newPasswordConfirmPlaceholder}
        type={passwordType}
        value={values.newPasswordConfirm}
      />
      <div className="space-y-3 pt-2">
        <SubmitButton
          label={findPasswordCopy.confirmSubmit}
          loading={submitting}
          loadingLabel={findPasswordCopy.confirmSubmitting}
        />
        <AuthSecondaryAction
          disabled={resending || resendIn > 0}
          label={resendIn > 0 ? findPasswordCopy.resendWait(resendIn) : findPasswordCopy.resend}
          onClick={onResend}
        />
      </div>
      <p className="text-center text-sm">
        <button className="text-muted hover:text-ink font-medium transition-colors" onClick={onBack} type="button">
          {findPasswordCopy.back}
        </button>
      </p>
    </form>
  );
};

export default PasswordResetConfirmForm;
