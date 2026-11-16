import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

const CLOSE_DELAY_MS = 150;

/**
 * 마우스를 올리면 열리고, 벗어나면 잠깐 뒤 닫히는 메뉴 (REQ-HEADER-007).
 * 터치 기기를 위해 클릭으로도 여닫고, 페이지를 옮기면 닫는다.
 */
export const useHoverMenu = () => {
  const [open, setOpen] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const { pathname, search } = useLocation();

  const cancelClose = () => window.clearTimeout(timer.current);
  const show = useCallback(() => {
    cancelClose();
    setOpen(true);
  }, []);
  const hide = useCallback(() => {
    cancelClose();
    timer.current = window.setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
  }, []);
  const close = useCallback(() => {
    cancelClose();
    setOpen(false);
  }, []);
  const toggle = useCallback(() => {
    cancelClose();
    setOpen((v) => !v);
  }, []);

  useEffect(() => close, [close]);
  useEffect(() => {
    close();
  }, [pathname, search, close]);

  return { open, show, hide, close, toggle };
};
