import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../data/layout';
import { useAuth } from '../auth/useAuth';

/**
 * 로그인이 필요한 동작(댓글·이모지) 앞에 두는 확인 장치.
 * ensureLogin()이 false면 동작을 막고 "로그인 필요" 팝업을 연다.
 */
export const useLoginGate = () => {
  const navigate = useNavigate();
  const { status } = useAuth();
  const [open, setOpen] = useState(false);

  const ensureLogin = useCallback(() => {
    if (status === 'authenticated') return true;
    setOpen(true);
    return false;
  }, [status]);

  const close = useCallback(() => setOpen(false), []);

  const goLogin = useCallback(() => {
    setOpen(false);
    navigate(ROUTES.login);
  }, [navigate]);

  return { open, ensureLogin, close, goLogin };
};
