import React from 'react';
import { findPasswordCopy } from '../../data/auth';
import type { FieldErrors } from '../../hooks/auth/authFormHelpers';
import type { FindPasswordField, FindPasswordValues } from '../../hooks/auth/useFindPasswordForm';
import { FormField } from './FormField';
import { PasswordToggleButton } from './PasswordToggleButton';
import { SubmitButton } from './SubmitButton';

interface NewPasswordFormProps {
  readonly values: FindPasswordValues;
  readonly errors: FieldErrors<FindPasswordField>;
  readonly showPassword: boolean;
  readonly submitting: boolean;
  readonly onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readonly onTogglePassword: () => void;
  readonly onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

/* data-component="NewPasswordForm" — 비밀번호 찾기 3단계: 새 비밀번호 */
export const NewPasswordForm: React.FC<NewPasswordFormProps> = ({
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
    <form className="space-y-5" id="newPasswordForm" noValidate onSubmit={onSubmit}>
      {/* 비밀번호 관리자가 어느 계정의 비밀번호인지 알 수 있게 아이디를 숨겨서 함께 둔다. */}
      <input autoComplete="username" className="hidden" name="username" readOnly type="text" value={values.loginId} />
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
      <div className="pt-2">
        <SubmitButton
          label={findPasswordCopy.confirmSubmit}
          loading={submitting}
          loadingLabel={findPasswordCopy.confirmSubmitting}
        />
      </div>
    </form>
  );
};

export default NewPasswordForm;
