import React from 'react';
import { AuthContext } from '../../hooks/auth/authContext';
import { useAuthState } from '../../hooks/auth/useAuthState';

interface AuthProviderProps {
  readonly children: React.ReactNode;
}

/** 앱 전체에 로그인 상태를 제공한다. */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const value = useAuthState();
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
