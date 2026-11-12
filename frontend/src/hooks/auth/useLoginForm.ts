import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api/auth';
import { ApiError } from '../../api/client';
import { loginCopy } from '../../data/auth';
import { useAuth } from './useAuth';

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

/** 서버 에러를 화면 문구로 바꾼다. 400·401은 서버 메시지가 사용자용 문구라 그대로 쓴다. */
const toErrorMessage = (err: unknown): string => {
  if (err instanceof ApiError) {
    if (err.code === 'NETWORK_ERROR') return loginCopy.networkError;
    if (err.status === 400 || err.status === 401) return err.message;
  }
  return loginCopy.unknownError;
};

/** Form state, validation and API submit for the login card. */
export const useLoginForm = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberId, setRememberId] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<LoginFieldErrors>({ userId: false, password: false });
  const [feedback, setFeedback] = useState<LoginFeedback | null>(null);
  const timers = useRef<number[]>([]);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      timers.current.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  const onUserIdChange = useCallback((e: ChangeEvent<HTMLInputElement>) => setUserId(e.target.value), []);
  const onPasswordChange = useCallback((e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value), []);
  const onRememberChange = useCallback((e: ChangeEvent<HTMLInputElement>) => setRememberId(e.target.checked), []);
  const togglePassword = useCallback(() => setShowPassword((v) => !v), []);

  const onSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (submitting) return;
      const next: LoginFieldErrors = { userId: !userId.trim(), password: !password.trim() };
      setErrors(next);
      if (next.userId || next.password) {
        setFeedback({ kind: 'error', message: loginCopy.missingFields });
        return;
      }
      setFeedback(null);
      setSubmitting(true);
      try {
        const user = await login({ loginId: userId.trim(), password });
        signIn(user);
        if (!mounted.current) return;
        setFeedback({ kind: 'success', title: loginCopy.success, message: loginCopy.successDetail });
        timers.current.push(window.setTimeout(() => navigate(loginCopy.redirectTo), 600));
      } catch (err) {
        if (!mounted.current) return;
        setFeedback({ kind: 'error', message: toErrorMessage(err) });
      } finally {
        if (mounted.current) setSubmitting(false);
      }
    },
    [navigate, password, signIn, submitting, userId],
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
