import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginCopy } from '../../data/auth';

export type LoginFeedbackKind = 'error' | 'success' | 'info';

export interface LoginFeedback {
  readonly kind: LoginFeedbackKind;
  readonly title?: string;
  readonly message: string;
}

export interface LoginFieldErrors {
  readonly userId: boolean;
  readonly password: boolean;
}

/** Form state, validation and simulated submit for the login card. */
export const useLoginForm = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberId, setRememberId] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<LoginFieldErrors>({ userId: false, password: false });
  const [feedback, setFeedback] = useState<LoginFeedback | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const onUserIdChange = useCallback((e: ChangeEvent<HTMLInputElement>) => setUserId(e.target.value), []);
  const onPasswordChange = useCallback((e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value), []);
  const onRememberChange = useCallback((e: ChangeEvent<HTMLInputElement>) => setRememberId(e.target.checked), []);
  const togglePassword = useCallback(() => setShowPassword((v) => !v), []);

  const onSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const next: LoginFieldErrors = { userId: !userId.trim(), password: !password.trim() };
      setErrors(next);
      if (next.userId || next.password) {
        setFeedback({ kind: 'error', message: loginCopy.missingFields });
        return;
      }
      setFeedback(null);
      setSubmitting(true);
      timers.current.push(
        window.setTimeout(() => {
          setSubmitting(false);
          setFeedback({ kind: 'success', title: loginCopy.success, message: loginCopy.successDetail });
          timers.current.push(window.setTimeout(() => navigate(loginCopy.redirectTo), 600));
        }, loginCopy.submitDelayMs),
      );
    },
    [navigate, password, userId],
  );

  const onSocialLogin = useCallback((providerLabel: string) => {
    setFeedback({ kind: 'info', message: loginCopy.socialPending(providerLabel) });
  }, []);

  return {
    userId,
    password,
    rememberId,
    showPassword,
    submitting,
    errors,
    feedback,
    onUserIdChange,
    onPasswordChange,
    onRememberChange,
    togglePassword,
    onSubmit,
    onSocialLogin,
  };
};

export default useLoginForm;
