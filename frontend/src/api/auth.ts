import { apiRequest } from './client';
import type { User } from './types';

export interface LoginRequest {
  readonly loginId: string;
  readonly password: string;
}

/** 로그인. 성공하면 서버가 httpOnly 쿠키로 토큰을 심는다. */
export const login = async (body: LoginRequest): Promise<User> => {
  const { user } = await apiRequest<{ readonly user: User }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return user;
};

/** 로그아웃 (쿠키 삭제). */
export const logout = (): Promise<void> => apiRequest<void>('/auth/logout', { method: 'POST' });

/** 현재 로그인한 사용자. 로그인 안 했으면 ApiError(401). */
export const getMe = async (): Promise<User> => {
  const { user } = await apiRequest<{ readonly user: User }>('/auth/me');
  return user;
};

export interface SignupRequest {
  readonly loginId: string;
  readonly password: string;
  readonly nickname: string;
  readonly email: string;
}

/** 회원가입. 가입만 하고 로그인 상태로 만들지는 않는다. */
export const signup = async (body: SignupRequest): Promise<User> => {
  const { user } = await apiRequest<{ readonly user: User }>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return user;
};

/** 아이디 찾기 — 가입된 이메일이면 그 메일로 아이디를 보낸다. 가입 여부와 관계없이 성공 응답. */
export const findLoginId = (email: string): Promise<{ readonly sent: true }> =>
  apiRequest<{ readonly sent: true }>('/auth/find-id', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });

export interface PasswordResetRequestResponse {
  readonly sent: true;
  /** 이 시간(초)이 지나야 인증코드를 다시 보낼 수 있다. */
  readonly resendAfterSeconds: number;
}

/** 비밀번호 찾기 1단계 — 아이디·이메일이 맞으면 인증코드 메일 발송. 일치 여부와 관계없이 성공 응답. */
export const requestPasswordReset = (body: { readonly loginId: string; readonly email: string }): Promise<PasswordResetRequestResponse> =>
  apiRequest<PasswordResetRequestResponse>('/auth/password-reset/request', {
    method: 'POST',
    body: JSON.stringify(body),
  });

export interface PasswordResetConfirmRequest {
  readonly loginId: string;
  readonly code: string;
  readonly newPassword: string;
}

/** 비밀번호 찾기 2단계 — 인증코드 확인 후 새 비밀번호 저장. */
export const confirmPasswordReset = (body: PasswordResetConfirmRequest): Promise<void> =>
  apiRequest<void>('/auth/password-reset/confirm', {
    method: 'POST',
    body: JSON.stringify(body),
  });
