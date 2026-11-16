import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  confirmPasswordReset,
  requestPasswordReset,
  verifyPasswordReset,
  type PasswordResetVerifyResponse,
} from '../../api/auth';
import { ApiError } from '../../api/client';
import { findPasswordCopy, verificationCopy, type LoginRedirectState } from '../../data/auth';
import { ROUTES } from '../../data/layout';
import {
  hasFieldErrors,
  isValidEmail,
  isValidPassword,
  toAuthErrorMessage,
  type AuthFeedback,
  type FieldErrors,
} from './authFormHelpers';
import { useVerificationCode } from './useVerificationCode';

/** request: 아이디·이메일 → verify: 인증코드 → reset: 새 비밀번호 */
export type FindPasswordStep = 'request' | 'verify' | 'reset';

export type FindPasswordField = 'loginId' | 'email' | 'newPassword' | 'newPasswordConfirm';

export type FindPasswordValues = Readonly<Record<FindPasswordField, string>>;

const EMPTY_VALUES: FindPasswordValues = { loginId: '', email: '', newPassword: '', newPasswordConfirm: '' };

const STEP_INDEX: Readonly<Record<FindPasswordStep, number>> = { request: 0, verify: 1, reset: 2 };

const isField = (name: string): name is FindPasswordField => name in EMPTY_VALUES;

const validateRequest = (values: FindPasswordValues): FieldErrors<FindPasswordField> => ({
  loginId: values.loginId.trim() ? undefined : findPasswordCopy.loginIdError,
  email: isValidEmail(values.email.trim()) ? undefined : findPasswordCopy.emailError,
});

const validateReset = (values: FindPasswordValues): FieldErrors<FindPasswordField> => ({
  newPassword: isValidPassword(values.newPassword) ? undefined : findPasswordCopy.newPasswordError,
  newPasswordConfirm:
    values.newPasswordConfirm && values.newPasswordConfirm === values.newPassword
      ? undefined
      : findPasswordCopy.newPasswordConfirmError,
});

/** 비밀번호 찾기 3단계 폼. 변경에 성공하면 로그인 화면으로 보낸다. */
export const useFindPasswordForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<FindPasswordStep>('request');
  const [values, setValues] = useState<FindPasswordValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<FieldErrors<FindPasswordField>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<AuthFeedback | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const loginId = values.loginId.trim().toLowerCase();
  const email = values.email.trim().toLowerCase();

  const verification = useVerificationCode<PasswordResetVerifyResponse>({
    request: useCallback(() => requestPasswordReset({ loginId, email }), [email, loginId]),
    verify: useCallback((code: string) => verifyPasswordReset({ loginId, email, code }), [email, loginId]),
    onVerified: useCallback((response: PasswordResetVerifyResponse) => {
      setResetToken(response.resetToken);
      setFeedback(null);
      setStep('reset');
    }, []),
    setFeedback,
  });
  const { begin } = verification;

  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!isField(name)) return;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
  }, []);

  const togglePassword = useCallback(() => setShowPassword((v) => !v), []);

  const onRequestSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (submitting) return;
      const nextErrors = validateRequest(values);
      setErrors(nextErrors);
      if (hasFieldErrors(nextErrors)) return;
      setFeedback(null);
      setSubmitting(true);
      try {
        const response = await requestPasswordReset({ loginId, email });
        if (!mounted.current) return;
        begin(response);
        setStep('verify');
        setFeedback({ kind: 'info', message: verificationCopy.sentNotice(email) });
      } catch (err) {
        if (mounted.current) setFeedback({ kind: 'error', message: toAuthErrorMessage(err) });
      } finally {
        if (mounted.current) setSubmitting(false);
      }
    },
    [begin, email, loginId, submitting, values],
  );

  /** 첫 단계로 돌아간다. 새 비밀번호 입력값과 재설정 토큰은 버린다. */
  const backToRequest = useCallback(() => {
    setStep('request');
    setErrors({});
    setResetToken(null);
    setValues((prev) => ({ ...prev, newPassword: '', newPasswordConfirm: '' }));
    setFeedback(null);
  }, []);

  const onResetSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (submitting || !resetToken) return;
      const nextErrors = validateReset(values);
      setErrors(nextErrors);
      if (hasFieldErrors(nextErrors)) {
        setFeedback({ kind: 'error', message: findPasswordCopy.invalidFields });
        return;
      }
      setFeedback(null);
      setSubmitting(true);
      try {
        await confirmPasswordReset({ resetToken, newPassword: values.newPassword });
        const state: LoginRedirectState = {
          loginId,
          noticeTitle: findPasswordCopy.doneTitle,
          noticeMessage: findPasswordCopy.doneMessage,
        };
        navigate(ROUTES.login, { replace: true, state });
      } catch (err) {
        if (!mounted.current) return;
        // 재설정 가능 시간(10분)이 지났으면 처음 단계부터 다시 해야 한다.
        if (err instanceof ApiError && err.code === 'INVALID_RESET_TOKEN') {
          backToRequest();
        }
        setFeedback({ kind: 'error', message: toAuthErrorMessage(err) });
      } finally {
        if (mounted.current) setSubmitting(false);
      }
    },
    [backToRequest, loginId, navigate, resetToken, submitting, values],
  );

  return {
    step,
    stepIndex: STEP_INDEX[step],
    values,
    errors,
    showPassword,
    submitting,
    feedback,
    verification,
    onChange,
    togglePassword,
    onRequestSubmit,
    onResetSubmit,
    backToRequest,
  };
};

export default useFindPasswordForm;
