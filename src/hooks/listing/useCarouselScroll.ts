import { useCallback, useRef } from 'react';

/** Horizontal scroll-by controls for an overflow-x container. */
export const useCarouselScroll = (step = 260) => {
  const ref = useRef<HTMLDivElement>(null);
  const scrollPrev = useCallback(() => ref.current?.scrollBy({ left: -step, behavior: 'smooth' }), [step]);
  const scrollNext = useCallback(() => ref.current?.scrollBy({ left: step, behavior: 'smooth' }), [step]);
  return { ref, scrollPrev, scrollNext } as const;
};
