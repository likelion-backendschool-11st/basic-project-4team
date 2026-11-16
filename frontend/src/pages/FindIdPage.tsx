import React from 'react';
import { AuthCard } from '../components/auth/AuthCard';
import { AuthPageShell } from '../components/auth/AuthPageShell';
import { FindIdForm } from '../components/auth/FindIdForm';
import { FindIdSentPanel } from '../components/auth/FindIdSentPanel';
import { LoginFeedbackAlert } from '../components/auth/LoginFeedbackAlert';
import { findIdCopy } from '../data/auth';
import { useFindIdForm } from '../hooks/auth/useFindIdForm';

interface FindIdPageProps {
  readonly className?: string;
}

/** 아이디 찾기 (#45, REQ-LOGIN-004) — 가입한 이메일로 아이디를 보낸다. */
export const FindIdPage: React.FC<FindIdPageProps> = ({ className = '' }) => {
  const form = useFindIdForm();

  return (
    <AuthPageShell className={className}>
      <AuthCard description={form.sentTo ? undefined : findIdCopy.description} title={findIdCopy.title}>
        <LoginFeedbackAlert feedback={form.feedback} />
        {form.sentTo ? (
          <FindIdSentPanel email={form.sentTo} onRetry={form.reset} />
        ) : (
          <FindIdForm
            email={form.email}
            emailError={form.emailError}
            onEmailChange={form.onEmailChange}
            onSubmit={form.onSubmit}
            submitting={form.submitting}
          />
        )}
      </AuthCard>
    </AuthPageShell>
  );
};

export default FindIdPage;
