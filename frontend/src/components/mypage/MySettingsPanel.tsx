import React from 'react';
import { Link } from 'react-router-dom';
import type { MyProfile } from '../../api/types';
import { AUTH_RULES } from '../../data/auth';
import { ROUTES } from '../../data/layout';
import { mySettingsCopy as copy } from '../../data/mypage';
import { useNicknameForm, usePasswordChangeForm } from '../../hooks/mypage/useAccountSettings';
import { formatDate } from '../../hooks/listing/listingViewHelpers';
import { FormField } from '../auth/FormField';
import { LoginFeedbackAlert } from '../auth/LoginFeedbackAlert';
import { PasswordToggleButton } from '../auth/PasswordToggleButton';

interface MySettingsPanelProps {
  readonly profile: MyProfile;
  readonly onProfileUpdated: (profile: MyProfile) => void;
}

interface SettingsSectionProps {
  readonly title: string;
  readonly description?: string;
  readonly children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, description, children }) => (
  <section className="py-space-lg border-b border-hairline last:border-b-0 first:pt-0">
    <h3 className="font-ui-label text-ui-label text-ink font-bold">{title}</h3>
    {description && <p className="mt-1 font-body-sm text-body-sm text-muted">{description}</p>}
    <div className="mt-space-md max-w-md">{children}</div>
  </section>
);

interface SettingsSubmitProps {
  readonly label: string;
  readonly loadingLabel: string;
  readonly loading: boolean;
  readonly disabled?: boolean;
}

const SettingsSubmit: React.FC<SettingsSubmitProps> = ({ label, loadingLabel, loading, disabled = false }) => (
  <button
    className="bg-primary-container hover:bg-primary-deep text-on-primary font-ui-label text-ui-label font-bold px-space-lg py-2.5 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    disabled={loading || disabled}
    type="submit"
  >
    {loading ? loadingLabel : label}
  </button>
);

/** 계정 설정 탭 — 계정 정보, 닉네임 변경(30일 1회), 비밀번호 변경. */
export const MySettingsPanel: React.FC<MySettingsPanelProps> = ({ profile, onProfileUpdated }) => {
  const nickname = useNicknameForm(profile, onProfileUpdated);
  const password = usePasswordChangeForm();
  const passwordType = password.showPassword ? 'text' : 'password';

  return (
    <div>
      <SettingsSection title={copy.accountTitle}>
        <dl className="grid grid-cols-[6rem_1fr] gap-y-space-sm font-body-sm text-body-sm">
          <dt className="text-muted">{copy.loginIdLabel}</dt>
          <dd className="text-ink">{profile.loginId}</dd>
          <dt className="text-muted">{copy.emailLabel}</dt>
          <dd className="text-ink break-all">{profile.email ?? '-'}</dd>
          <dt className="text-muted">{copy.joinedLabel}</dt>
          <dd className="text-ink">{formatDate(profile.createdAt)}</dd>
        </dl>
      </SettingsSection>

      <SettingsSection description={copy.nicknameDescription} title={copy.nicknameTitle}>
        <LoginFeedbackAlert feedback={nickname.feedback} />
        <form className="space-y-space-md" noValidate onSubmit={nickname.onSubmit}>
          <FormField
            autoComplete="nickname"
            errorText={nickname.error ?? ''}
            hasError={Boolean(nickname.error)}
            hint={
              nickname.locked && profile.nicknameChangeAvailableAt
                ? copy.nicknameLocked(formatDate(profile.nicknameChangeAvailableAt))
                : undefined
            }
            id="myNickname"
            label={copy.nicknameLabel}
            maxLength={AUTH_RULES.nicknameMax}
            name="nickname"
            onChange={nickname.onChange}
            placeholder={profile.nickname}
            type="text"
            value={nickname.nickname}
          />
          <SettingsSubmit
            disabled={nickname.locked}
            label={copy.nicknameSubmit}
            loading={nickname.submitting}
            loadingLabel={copy.nicknameSubmitting}
          />
        </form>
      </SettingsSection>

      <SettingsSection description={copy.passwordDescription} title={copy.passwordTitle}>
        <LoginFeedbackAlert feedback={password.feedback} />
        <form className="space-y-space-md" noValidate onSubmit={password.onSubmit}>
          {/* 비밀번호 관리자가 어느 계정의 비밀번호인지 알 수 있게 */}
          <input autoComplete="username" className="hidden" name="username" readOnly type="text" value={profile.loginId} />
          <FormField
            autoComplete="current-password"
            errorText={password.errors.currentPassword ?? ''}
            hasError={Boolean(password.errors.currentPassword)}
            id="myCurrentPassword"
            label={copy.currentPasswordLabel}
            name="currentPassword"
            onChange={password.onChange}
            placeholder={copy.currentPasswordPlaceholder}
            trailing={
              <PasswordToggleButton label={copy.passwordToggleLabel} onToggle={password.togglePassword} visible={password.showPassword} />
            }
            type={passwordType}
            value={password.values.currentPassword}
          />
          <FormField
            autoComplete="new-password"
            errorText={password.errors.newPassword ?? ''}
            hasError={Boolean(password.errors.newPassword)}
            id="myNewPassword"
            label={copy.newPasswordLabel}
            name="newPassword"
            onChange={password.onChange}
            placeholder={copy.newPasswordPlaceholder}
            type={passwordType}
            value={password.values.newPassword}
          />
          <FormField
            autoComplete="new-password"
            errorText={password.errors.newPasswordConfirm ?? ''}
            hasError={Boolean(password.errors.newPasswordConfirm)}
            id="myNewPasswordConfirm"
            label={copy.newPasswordConfirmLabel}
            name="newPasswordConfirm"
            onChange={password.onChange}
            placeholder={copy.newPasswordConfirmPlaceholder}
            type={passwordType}
            value={password.values.newPasswordConfirm}
          />
          <div className="flex flex-wrap items-center gap-space-md">
            <SettingsSubmit label={copy.passwordSubmit} loading={password.submitting} loadingLabel={copy.passwordSubmitting} />
            <Link className="font-ui-sm text-ui-sm text-link hover:underline" to={ROUTES.findPassword}>
              {copy.forgotPassword}
            </Link>
          </div>
        </form>
      </SettingsSection>
    </div>
  );
};

export default MySettingsPanel;
