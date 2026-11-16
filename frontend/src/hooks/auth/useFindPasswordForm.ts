import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { confirmPasswordReset, requestPasswordReset } from '../../api/auth';
import { AUTH_RULES, findPasswordCopy, type LoginRedirectState } from '../../data/auth';
import { ROUTES } from '../../data/layout';
import {
  hasFieldErrors,
  isValidEmail,
  isValidPassword,
  toAuthErrorMessage,
  type AuthFeedback,
  type FieldErrors,
} from './authFormHelpers';

/** request: 아이디·이메일 입력 → confirm: 인증코드·새 비밀번호 입력 */
export type FindPasswordStep = 'request' | 'confirm';

export type FindPasswordField = 'loginId' | 'email' | 'code' | 'newPassword' | 'newPasswordConfirm';

export type FindPasswordValues = Readonly<Record<FindPasswordField, string>>;

const EMPTY_VALUES: FindPasswordValues = { loginId: '', email: '', code: '', newPassword: '', newPasswordConfirm: '' };

const isField = (name: string): name is FindPasswordField => name in EMPTY_VALUES;

const validateRequest = (values: FindPasswordValues): FieldErrors<FindPasswordField> => ({
  loginId: values.loginId.trim() ? undefined : findPasswordCopy.loginIdError,
  email: isValidEmail(values.email.trim()) ? undefined : findPasswordCopy.emailError,
});

const validateConfirm = (values: FindPasswordValues): FieldErrors<FindPasswordField> => ({
  code: AUTH_RULES.resetCodePattern.test(values.code.trim()) ? undefined : findPasswordCopy.codeError,
  newPassword: isValidPassword(values.newPassword) ? undefined : findPasswordCopy.newPasswordError,
  newPasswordConfirm:
    values.newPasswordConfirm && values.newPasswordConfirm === values.newPassword
      ? undefined
      : findPasswordCopy.newPasswordConfirmError,
});

/** 비밀번호 찾기 2단계 폼. 변경에 성공하면 로그인 화면으로 보낸다. */
export const useFindPasswordForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<FindPasswordStep>('request');
  const [values, setValues] = useState<FindPasswordValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<FieldErrors<FindPasswordField>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [feedback, setFeedback] = useState<AuthFeedback | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // 재발송 대기 시간 카운트다운 (서버의 재발송 제한과 같은 시간)
  useEffect(() => {
    if (resendIn <= 0) return undefined;
    const timer = window.setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendIn]);

  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!isField(name)) return;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
  }, []);

  const togglePassword = useCallback(() => setShowPassword((v) => !v), []);

  const normalized = useCallback(
    () => ({ loginId: values.loginId.trim().toLowerCase(), email: values.email.trim().toLowerCase() }),
    [values.email, values.loginId],
  );

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
        const { resendAfterSeconds } = await requestPasswordReset(normalized());
        if (!mounted.current) return;
        setStep('confirm');
        setResendIn(resendAfterSeconds);
        setFeedback({ kind: 'info', message: findPasswordCopy.sentNotice });
      } catch (err) {
        if (mounted.current) setFeedback({ kind: 'error', message: toAuthErrorMessage(err) });
      } finally {
        if (mounted.current) setSubmitting(false);
      }
    },
    [normalized, submitting, values],
  );

  const resend = useCallback(async () => {
    if (resending || resendIn > 0) return;
    setResending(true);
    try {
      const { resendAfterSeconds } = await requestPasswordReset(normalized());
      if (!mounted.current) return;
      setResendIn(resendAfterSeconds);
      setValues((prev) => ({ ...prev, code: '' }));
      setFeedback({ kind: 'info', message: findPasswordCopy.resent });
    } catch (err) {
      if (mounted.current) setFeedback({ kind: 'error', message: toAuthErrorMessage(err) });
    } finally {
      if (mounted.current) setResending(false);
    }
  }, [normalized, resendIn, resending]);

  const onConfirmSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (submitting) return;
      const nextErrors = validateConfirm(values);
      setErrors(nextErrors);
      if (hasFieldErrors(nextErrors)) {
        setFeedback({ kind: 'error', message: findPasswordCopy.invalidFields });
        return;
      }
      setFeedback(null);
      setSubmitting(true);
      try {
        const { loginId } = normalized();
        await confirmPasswordReset({ loginId, code: values.code.trim(), newPassword: values.newPassword });
        const state: LoginRedirectState = {
          loginId,
          noticeTitle: findPasswordCopy.doneTitle,
          noticeMessage: findPasswordCopy.doneMessage,
        };
        navigate(ROUTES.login, { replace: true, state });
      } catch (err) {
        if (!mounted.current) return;
        setFeedback({ kind: 'error', message: toAuthErrorMessage(err) });
        setValues((prev) => ({ ...prev, code: '' }));
      } finally {
        if (mounted.current) setSubmitting(false);
      }
    },
    [navigate, normalized, submitting, values],
  );

  /** 아이디·이메일 입력 단계로 돌아간다. */
  const backToRequest = useCallback(() => {
    setStep('request');
    setFeedback(null);
    setErrors({});
    setValues((prev) => ({ ...prev, code: '', newPassword: '', newPasswordConfirm: '' }));
  }, []);

  return {
    step,
    values,
    errors,
    showPassword,
    submitting,
    resending,
    resendIn,
    feedback,
    sentTo: normalized().email,
    onChange,
    togglePassword,
    onRequestSubmit,
    onConfirmSubmit,
    resend,
    backToRequest,
  };
};

export default useFindPasswordForm;
