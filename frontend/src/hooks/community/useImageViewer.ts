import { useCallback, useState } from 'react';

/** 사진 확대 보기 상태 — 열린 사진 순번(없으면 null), 이전·다음은 처음·끝에서 돌아간다. */
export const useImageViewer = (count: number) => {
  const [index, setIndex] = useState<number | null>(null);

  const open = useCallback((i: number) => setIndex(i), []);
  const close = useCallback(() => setIndex(null), []);
  const prev = useCallback(() => setIndex((i) => (i === null ? i : (i - 1 + count) % count)), [count]);
  const next = useCallback(() => setIndex((i) => (i === null ? i : (i + 1) % count)), [count]);

  return { index, open, close, prev, next };
};
