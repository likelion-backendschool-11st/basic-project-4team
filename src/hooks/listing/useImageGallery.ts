import { useCallback, useState } from 'react';

export interface ImageGalleryState {
  readonly index: number;
  readonly total: number;
  readonly prev: () => void;
  readonly next: () => void;
  readonly select: (index: number) => void;
}

/** Index-based carousel state: wrap-around prev/next and thumbnail select. */
export const useImageGallery = (total: number, initialIndex = 0): ImageGalleryState => {
  const [index, setIndex] = useState(initialIndex);

  const select = useCallback(
    (i: number) => {
      if (i < 0 || i >= total) return;
      setIndex(i);
    },
    [total],
  );
  const prev = useCallback(() => setIndex((i) => (i - 1 + total) % total), [total]);
  const next = useCallback(() => setIndex((i) => (i + 1) % total), [total]);

  return { index, total, prev, next, select };
};
