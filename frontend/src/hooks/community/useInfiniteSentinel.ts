import { useEffect, useRef } from 'react';

/** Calls `onReach` whenever the returned sentinel element scrolls into view. */
export const useInfiniteSentinel = <T extends Element>(onReach: () => void, enabled: boolean) => {
  const ref = useRef<T | null>(null);
  const callback = useRef(onReach);
  callback.current = onReach;

  useEffect(() => {
    const node = ref.current;
    if (!node || !enabled || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) callback.current();
      },
      { rootMargin: '120px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled]);

  return ref;
};
