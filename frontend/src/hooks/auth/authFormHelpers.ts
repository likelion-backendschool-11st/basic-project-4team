import { ApiError } from '../../api/client';
import { AUTH_RULES, authErrorCopy } from '../../data/auth';
import type { LoginFeedback } from './useLoginForm';

/** 회원가입·찾기 화면의 상단 알림. 로그인 화면과 같은 모양을 쓴다. */
export type AuthFeedback = LoginFeedback;

/** 필드별 에러 문구. 값이 없으면 정상. */
export type FieldErrors<Field extends string> = Partial<Record<Field, string>>;

/** 서버 에러 → 화면 문구. 4xx는 서버 메시지가 사용자용 문구라 그대로 쓴다. */
export const toAuthErrorMessage = (err: unknown): string => {
  if (err instanceof ApiError) {
    if (err.code === 'NETWORK_ERROR') return authErrorCopy.network;
    if (err.status >= 400 && err.status < 500) return err.message;
  }
  return authErrorCopy.unknown;
};

/** 서버와 같은 기준: 8자 이상, UTF-8 72바이트 이하 (bcrypt 한계). */
export const isValidPassword = (password: string): boolean =>
  password.length >= AUTH_RULES.passwordMin && new TextEncoder().encode(password).length <= AUTH_RULES.passwordMaxBytes;

export const isValidEmail = (email: string): boolean => AUTH_RULES.emailPattern.test(email);

/** 에러가 하나라도 있는지. */
export const hasFieldErrors = <Field extends string>(errors: FieldErrors<Field>): boolean =>
  Object.values(errors).some(Boolean);
