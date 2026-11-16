import React from 'react';
import { Link } from 'react-router-dom';
import { AuthCard } from '../components/auth/AuthCard';
import { AuthPageShell } from '../components/auth/AuthPageShell';
import { LoginFeedbackAlert } from '../components/auth/LoginFeedbackAlert';
import { SignupForm } from '../components/auth/SignupForm';
import { signupCopy } from '../data/auth';
import { ROUTES } from '../data/layout';
import { useSignupForm } from '../hooks/auth/useSignupForm';

interface SignupPageProps {
  readonly className?: string;
}

/** 회원가입 (#43) — POST /auth/signup. 성공하면 로그인 화면으로 이동. */
export const SignupPage: React.FC<SignupPageProps> = ({ className = '' }) => {
  const form = useSignupForm();

  return (
    <AuthPageShell className={className}>
      <AuthCard description={signupCopy.description} title={signupCopy.title}>
        <LoginFeedbackAlert feedback={form.feedback} />
        <SignupForm
          errors={form.errors}
          onChange={form.onChange}
          onSubmit={form.onSubmit}
          onTogglePassword={form.togglePassword}
          showPassword={form.showPassword}
          submitting={form.submitting}
          values={form.values}
        />
        <p className="mt-6 pt-5 border-t border-hairline text-center text-sm text-muted">
          {signupCopy.loginPrompt}{' '}
          <Link className="text-link font-bold hover:text-primary-container transition-colors" to={ROUTES.login}>
            {signupCopy.loginLink}
          </Link>
        </p>
      </AuthCard>
    </AuthPageShell>
  );
};

export default SignupPage;
