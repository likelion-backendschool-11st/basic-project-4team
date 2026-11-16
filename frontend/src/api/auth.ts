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

/** 인증코드 요청 응답. 가입 여부와 관계없이 같은 값이 온다. */
export interface VerificationRequestResponse {
  readonly sent: true;
  /** 이 시간(초)이 지나야 인증코드를 다시 보낼 수 있다. */
  readonly resendAfterSeconds: number;
  /** 인증코드 유효 시간(초). */
  readonly expiresInSeconds: number;
}

/** 아이디 찾기 1단계 — 가입된 이메일이면 인증코드 메일 발송. */
export const requestFindId = (email: string): Promise<VerificationRequestResponse> =>
  apiRequest<VerificationRequestResponse>('/auth/find-id/request', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });

export interface FindIdResult {
  readonly loginId: string;
  readonly createdAt: string;
}

/** 아이디 찾기 2단계 — 인증코드가 맞으면 아이디. */
export const verifyFindId = (body: { readonly email: string; readonly code: string }): Promise<FindIdResult> =>
  apiRequest<FindIdResult>('/auth/find-id/verify', {
    method: 'POST',
    body: JSON.stringify(body),
  });

export interface PasswordResetAccount {
  readonly loginId: string;
  readonly email: string;
}

/** 비밀번호 찾기 1단계 — 아이디·이메일이 맞으면 인증코드 메일 발송. */
export const requestPasswordReset = (body: PasswordResetAccount): Promise<VerificationRequestResponse> =>
  apiRequest<VerificationRequestResponse>('/auth/password-reset/request', {
    method: 'POST',
    body: JSON.stringify(body),
  });

export interface PasswordResetVerifyResponse {
  /** 새 비밀번호 저장에 쓰는 일회용 토큰. */
  readonly resetToken: string;
  readonly expiresInSeconds: number;
}

/** 비밀번호 찾기 2단계 — 인증코드가 맞으면 재설정 토큰. */
export const verifyPasswordReset = (body: PasswordResetAccount & { readonly code: string }): Promise<PasswordResetVerifyResponse> =>
  apiRequest<PasswordResetVerifyResponse>('/auth/password-reset/verify', {
    method: 'POST',
    body: JSON.stringify(body),
  });

/** 비밀번호 찾기 3단계 — 재설정 토큰으로 새 비밀번호 저장. */
export const confirmPasswordReset = (body: { readonly resetToken: string; readonly newPassword: string }): Promise<void> =>
  apiRequest<void>('/auth/password-reset/confirm', {
    method: 'POST',
    body: JSON.stringify(body),
  });
