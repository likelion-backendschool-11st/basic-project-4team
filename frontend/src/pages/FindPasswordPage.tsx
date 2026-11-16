import React from 'react';
import { AuthCard } from '../components/auth/AuthCard';
import { AuthPageShell } from '../components/auth/AuthPageShell';
import { LoginFeedbackAlert } from '../components/auth/LoginFeedbackAlert';
import { PasswordResetConfirmForm } from '../components/auth/PasswordResetConfirmForm';
import { PasswordResetRequestForm } from '../components/auth/PasswordResetRequestForm';
import { findPasswordCopy } from '../data/auth';
import { useFindPasswordForm } from '../hooks/auth/useFindPasswordForm';

interface FindPasswordPageProps {
  readonly className?: string;
}

/** 비밀번호 찾기 (#45) — 이메일 인증코드 확인 후 새 비밀번호로 변경. */
export const FindPasswordPage: React.FC<FindPasswordPageProps> = ({ className = '' }) => {
  const form = useFindPasswordForm();
  const description =
    form.step === 'request' ? findPasswordCopy.requestDescription : findPasswordCopy.confirmDescription(form.sentTo);

  return (
    <AuthPageShell className={className}>
      <AuthCard description={description} title={findPasswordCopy.title}>
        <LoginFeedbackAlert feedback={form.feedback} />
        {form.step === 'request' ? (
          <PasswordResetRequestForm
            errors={form.errors}
            onChange={form.onChange}
            onSubmit={form.onRequestSubmit}
            submitting={form.submitting}
            values={form.values}
          />
        ) : (
          <PasswordResetConfirmForm
            errors={form.errors}
            onBack={form.backToRequest}
            onChange={form.onChange}
            onResend={form.resend}
            onSubmit={form.onConfirmSubmit}
            onTogglePassword={form.togglePassword}
            resendIn={form.resendIn}
            resending={form.resending}
            showPassword={form.showPassword}
            submitting={form.submitting}
            values={form.values}
          />
        )}
      </AuthCard>
    </AuthPageShell>
  );
};

export default FindPasswordPage;
