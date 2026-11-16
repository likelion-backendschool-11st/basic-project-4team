import { useCallback, useEffect, useState } from 'react';

/** 초 단위 카운트다운. 탭이 백그라운드여도 정확하도록 마감 시각 기준으로 계산한다. */
export const useCountdown = () => {
  const [deadline, setDeadline] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (deadline === null) return undefined;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [deadline]);

  const remaining = deadline === null ? 0 : Math.max(0, Math.ceil((deadline - now) / 1000));

  useEffect(() => {
    if (deadline !== null && remaining === 0) setDeadline(null);
  }, [deadline, remaining]);

  const start = useCallback((seconds: number) => {
    const startedAt = Date.now();
    setNow(startedAt);
    setDeadline(startedAt + seconds * 1000);
  }, []);

  const stop = useCallback(() => setDeadline(null), []);

  return { remaining, running: deadline !== null, start, stop };
};

/** 남은 초 → "9:05". */
export const formatMinSec = (seconds: number): string =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

export default useCountdown;
