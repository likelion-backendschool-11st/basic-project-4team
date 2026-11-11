import { useCallback, useEffect, useRef, useState } from 'react';

export interface ToastState {
  readonly message: string;
  readonly icon: string;
  readonly visible: boolean;
}

export type ShowToast = (message: string, icon?: string) => void;

/** Transient feedback toast. */
export const useToast = (duration = 2400) => {
  const [toast, setToast] = useState<ToastState>({ message: '', icon: 'check_circle', visible: false });
  const timer = useRef<number | undefined>(undefined);

  const showToast: ShowToast = useCallback(
    (message: string, icon = 'check_circle') => {
      window.clearTimeout(timer.current);
      setToast({ message, icon, visible: true });
      timer.current = window.setTimeout(() => setToast((t) => ({ ...t, visible: false })), duration);
    },
    [duration],
  );

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return { toast, showToast } as const;
};
