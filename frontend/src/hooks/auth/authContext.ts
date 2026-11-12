import { createContext } from 'react';
import type { User } from '../../api/types';

/** loading: 첫 /me 확인 중, authenticated: 로그인됨, guest: 비로그인. */
export type AuthStatus = 'loading' | 'authenticated' | 'guest';

export interface AuthContextValue {
  readonly user: User | null;
  readonly status: AuthStatus;
  readonly loggingOut: boolean;
  /** 로그인 성공 직후 호출해 전역 상태에 반영한다. */
  readonly signIn: (user: User) => void;
  /** 서버 쿠키를 지우고 비로그인 상태로 바꾼다. 실패하면 throw. */
  readonly signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
