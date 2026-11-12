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
