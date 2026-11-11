import React from 'react';
import { AuthCard } from '../components/auth/AuthCard';
import { AuthFooter } from '../components/auth/AuthFooter';
import { AuthTopBar } from '../components/auth/AuthTopBar';
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
    <div className={`bg-canvas-soft text-body min-h-screen flex flex-col justify-between selection:bg-mint-100 selection:text-ink ${className}`}>
      <AuthTopBar />
      <main className="flex-grow flex items-center justify-center px-4 py-12">
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
      </main>
      <AuthFooter />
    </div>
  );
};

export default LoginPage;
