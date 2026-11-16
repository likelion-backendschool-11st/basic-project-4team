import React from 'react';
import { AuthCard } from '../components/auth/AuthCard';
import { AuthPageShell } from '../components/auth/AuthPageShell';
import { AuthStepIndicator } from '../components/auth/AuthStepIndicator';
import { LoginFeedbackAlert } from '../components/auth/LoginFeedbackAlert';
import { NewPasswordForm } from '../components/auth/NewPasswordForm';
import { PasswordResetRequestForm } from '../components/auth/PasswordResetRequestForm';
import { VerificationCodeForm } from '../components/auth/VerificationCodeForm';
import { findPasswordCopy } from '../data/auth';
import { useFindPasswordForm } from '../hooks/auth/useFindPasswordForm';

interface FindPasswordPageProps {
  readonly className?: string;
}

const DESCRIPTION = {
  request: findPasswordCopy.requestDescription,
  verify: findPasswordCopy.verifyDescription,
  reset: findPasswordCopy.resetDescription,
} as const;

/** 비밀번호 찾기 (#45) — 아이디·이메일 → 이메일 인증코드 → 새 비밀번호. */
export const FindPasswordPage: React.FC<FindPasswordPageProps> = ({ className = '' }) => {
  const form = useFindPasswordForm();
  const { verification } = form;

  return (
    <AuthPageShell className={className}>
      <AuthCard description={DESCRIPTION[form.step]} title={findPasswordCopy.title}>
        <AuthStepIndicator current={form.stepIndex} steps={findPasswordCopy.steps} />
        <LoginFeedbackAlert feedback={form.feedback} />
        {form.step === 'request' && (
          <PasswordResetRequestForm
            errors={form.errors}
            onChange={form.onChange}
            onSubmit={form.onRequestSubmit}
            submitting={form.submitting}
            values={form.values}
          />
        )}
        {form.step === 'verify' && (
          <VerificationCodeForm
            code={verification.code}
            codeError={verification.codeError}
            expiresIn={verification.expiresIn}
            onBack={form.backToRequest}
            onCodeChange={verification.onCodeChange}
            onResend={verification.resend}
            onSubmit={verification.onSubmit}
            resendIn={verification.resendIn}
            resending={verification.resending}
            verifying={verification.verifying}
          />
        )}
        {form.step === 'reset' && (
          <NewPasswordForm
            errors={form.errors}
            onChange={form.onChange}
            onSubmit={form.onResetSubmit}
            onTogglePassword={form.togglePassword}
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
