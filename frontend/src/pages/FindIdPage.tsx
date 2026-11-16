import React from 'react';
import { AuthCard } from '../components/auth/AuthCard';
import { AuthPageShell } from '../components/auth/AuthPageShell';
import { AuthStepIndicator } from '../components/auth/AuthStepIndicator';
import { FindIdForm } from '../components/auth/FindIdForm';
import { FindIdResultPanel } from '../components/auth/FindIdResultPanel';
import { LoginFeedbackAlert } from '../components/auth/LoginFeedbackAlert';
import { VerificationCodeForm } from '../components/auth/VerificationCodeForm';
import { findIdCopy } from '../data/auth';
import { useFindIdForm } from '../hooks/auth/useFindIdForm';

interface FindIdPageProps {
  readonly className?: string;
}

const DESCRIPTION = {
  request: findIdCopy.requestDescription,
  verify: findIdCopy.verifyDescription,
  done: findIdCopy.resultDescription,
} as const;

/** 아이디 찾기 (#45, REQ-LOGIN-004) — 이메일 인증코드 확인 후 아이디 표시. */
export const FindIdPage: React.FC<FindIdPageProps> = ({ className = '' }) => {
  const form = useFindIdForm();
  const { verification } = form;

  return (
    <AuthPageShell className={className}>
      <AuthCard description={DESCRIPTION[form.step]} title={findIdCopy.title}>
        <AuthStepIndicator current={form.stepIndex} steps={findIdCopy.steps} />
        <LoginFeedbackAlert feedback={form.feedback} />
        {form.step === 'request' && (
          <FindIdForm
            email={form.email}
            emailError={form.emailError}
            onEmailChange={form.onEmailChange}
            onSubmit={form.onRequestSubmit}
            submitting={form.submitting}
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
        {form.step === 'done' && form.result && (
          <FindIdResultPanel createdAt={form.result.createdAt} loginId={form.result.loginId} />
        )}
      </AuthCard>
    </AuthPageShell>
  );
};

export default FindIdPage;
