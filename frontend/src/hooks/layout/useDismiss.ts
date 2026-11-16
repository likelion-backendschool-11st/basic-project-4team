import { useEffect, type RefObject } from 'react';

/** 열려 있는 동안 바깥 클릭·Esc로 닫는다. */
export const useDismiss = (open: boolean, ref: RefObject<HTMLElement | null>, onClose: () => void): void => {
  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, ref, onClose]);
};
