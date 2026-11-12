import { useCallback, useEffect, useMemo, useState } from 'react';
import { getMe, logout } from '../../api/auth';
import type { User } from '../../api/types';
import type { AuthContextValue, AuthStatus } from './authContext';

/** AuthProvider 내부 상태. 앱 시작 시 쿠키로 로그인 상태를 복원한다. */
export const useAuthState = (): AuthContextValue => {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getMe()
      .then((me) => {
        if (cancelled) return;
        setUser(me);
        setStatus('authenticated');
      })
      .catch(() => {
        // 401(비로그인)·서버 꺼짐 모두 비로그인으로 보여준다.
        if (!cancelled) setStatus('guest');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback((next: User) => {
    setUser(next);
    setStatus('authenticated');
  }, []);

  const signOut = useCallback(async () => {
    setLoggingOut(true);
    try {
      await logout();
      setUser(null);
      setStatus('guest');
    } finally {
      setLoggingOut(false);
    }
  }, []);

  return useMemo(
    () => ({ user, status, loggingOut, signIn, signOut }),
    [user, status, loggingOut, signIn, signOut],
  );
};
