import { useContext } from 'react';
import { AuthContext, type AuthContextValue } from './authContext';

/** 현재 로그인 상태와 signIn/signOut. AuthProvider 안에서만 쓸 수 있다. */
export const useAuth = (): AuthContextValue => {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth는 AuthProvider 안에서 사용해야 합니다.');
  }
  return value;
};
