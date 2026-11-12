import { useCallback } from 'react';
import { headerData } from '../../data/layout';
import { useAuth } from '../auth/useAuth';

/** 헤더 우측 사용자 영역 상태 + 로그아웃 처리. */
export const useHeaderAuth = () => {
  const { user, status, loggingOut, signOut } = useAuth();

  const onLogout = useCallback(async () => {
    try {
      await signOut();
    } catch {
      window.alert(headerData.logoutError);
    }
  }, [signOut]);

  return { user, status, loggingOut, onLogout };
};
