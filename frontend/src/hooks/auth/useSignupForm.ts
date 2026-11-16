import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { signup } from '../../api/auth';
import { ApiError } from '../../api/client';
import { AUTH_RULES, signupCopy, type LoginRedirectState } from '../../data/auth';
import { ROUTES } from '../../data/layout';
import {
  hasFieldErrors,
  isValidEmail,
  isValidPassword,
  toAuthErrorMessage,
  type AuthFeedback,
  type FieldErrors,
} from './authFormHelpers';

export type SignupField = 'loginId' | 'password' | 'passwordConfirm' | 'nickname' | 'email';

export type SignupValues = Readonly<Record<SignupField, string>>;

const EMPTY_VALUES: SignupValues = { loginId: '', password: '', passwordConfirm: '', nickname: '', email: '' };

/** 409 중복 에러 코드 → 메시지를 띄울 입력칸. */
const DUPLICATE_FIELD: Readonly<Record<string, SignupField>> = {
  DUPLICATE_LOGIN_ID: 'loginId',
  DUPLICATE_NICKNAME: 'nickname',
  DUPLICATE_EMAIL: 'email',
};

const isSignupField = (name: string): name is SignupField => name in EMPTY_VALUES;

/** 서버와 같은 규칙으로 입력값을 검사한다. */
const validate = (values: SignupValues): FieldErrors<SignupField> => {
  const loginId = values.loginId.trim().toLowerCase();
  const nickname = values.nickname.trim();
  return {
    loginId: AUTH_RULES.loginIdPattern.test(loginId) ? undefined : signupCopy.loginIdError,
    password: isValidPassword(values.password) ? undefined : signupCopy.passwordError,
    passwordConfirm:
      values.passwordConfirm && values.passwordConfirm === values.password ? undefined : signupCopy.passwordConfirmError,
    nickname: nickname.length > 0 && nickname.length <= AUTH_RULES.nicknameMax ? undefined : signupCopy.nicknameError,
    email: isValidEmail(values.email.trim()) ? undefined : signupCopy.emailError,
  };
};

/** 회원가입 폼 상태·검사·제출. 성공하면 로그인 화면으로 보낸다. */
export const useSignupForm = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState<SignupValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<FieldErrors<SignupField>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<AuthFeedback | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!isSignupField(name)) return;
    setValues((prev) => ({ ...prev, [name]: value }));
    // 고치는 중인 칸의 에러는 지운다 — 다시 제출할 때 새로 검사한다.
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
  }, []);

  const togglePassword = useCallback(() => setShowPassword((v) => !v), []);

  const onSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (submitting) return;
      const nextErrors = validate(values);
      setErrors(nextErrors);
      if (hasFieldErrors(nextErrors)) {
        setFeedback({ kind: 'error', message: signupCopy.invalidFields });
        return;
      }
      setFeedback(null);
      setSubmitting(true);
      try {
        const user = await signup({
          loginId: values.loginId.trim().toLowerCase(),
          password: values.password,
          nickname: values.nickname.trim(),
          email: values.email.trim().toLowerCase(),
        });
        const state: LoginRedirectState = {
          loginId: user.loginId,
          noticeTitle: signupCopy.doneTitle,
          noticeMessage: signupCopy.doneMessage,
        };
        navigate(ROUTES.login, { replace: true, state });
      } catch (err) {
        if (!mounted.current) return;
        const field = err instanceof ApiError ? DUPLICATE_FIELD[err.code] : undefined;
        if (field) {
          setErrors((prev) => ({ ...prev, [field]: (err as ApiError).message }));
          setFeedback(null);
        } else {
          setFeedback({ kind: 'error', message: toAuthErrorMessage(err) });
        }
      } finally {
        if (mounted.current) setSubmitting(false);
      }
    },
    [navigate, submitting, values],
  );

  return { values, errors, showPassword, submitting, feedback, onChange, togglePassword, onSubmit };
};

export default useSignupForm;
