import React from 'react';
import { AuthCard } from '../components/auth/AuthCard';
import { AuthPageShell } from '../components/auth/AuthPageShell';
import { AuthUtilityLinks } from '../components/auth/AuthUtilityLinks';
import { LoginFeedbackAlert } from '../components/auth/LoginFeedbackAlert';
import { LoginForm } from '../components/auth/LoginForm';
import { SocialLoginButtons } from '../components/auth/SocialLoginButtons';
import { TestAccountNotice } from '../components/auth/TestAccountNotice';
import { loginCopy, socialLogin, testAccountNotice, utilityLinks } from '../data/auth';
import { useLoginForm } from '../hooks/auth/useLoginForm';

interface LoginPageProps {
  readonly className?: string;
}

/** P-000 로그인 — standalone page (no AppLayout). */
export const LoginPage: React.FC<LoginPageProps> = ({ className = '' }) => {
  const form = useLoginForm();

  return (
    <AuthPageShell className={className}>
      <AuthCard title={loginCopy.title}>
        <LoginFeedbackAlert feedback={form.feedback} />
        <LoginForm
          errors={form.errors}
          onPasswordChange={form.onPasswordChange}
          onRememberChange={form.onRememberChange}
          onSubmit={form.onSubmit}
          onTogglePassword={form.togglePassword}
          onUserIdChange={form.onUserIdChange}
          password={form.password}
          rememberId={form.rememberId}
          showPassword={form.showPassword}
          submitting={form.submitting}
          userId={form.userId}
        />
        <AuthUtilityLinks links={utilityLinks} />
        <SocialLoginButtons
          dividerLabel={socialLogin.dividerLabel}
          onSelect={form.onSocialLogin}
          providers={socialLogin.providers}
        />
        <TestAccountNotice body={testAccountNotice.body} title={testAccountNotice.title} />
      </AuthCard>
    </AuthPageShell>
  );
};

export default LoginPage;
