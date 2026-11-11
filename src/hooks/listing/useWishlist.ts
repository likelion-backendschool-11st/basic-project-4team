import { useCallback, useState } from 'react';

/** Wishlist (찜) toggle with live count. `onChange` receives the new state. */
export const useWishlist = (initialCount: number, onChange?: (wished: boolean) => void) => {
  const [wished, setWished] = useState(false);
  const [count, setCount] = useState(initialCount);

  const toggle = useCallback(() => {
    const nextWished = !wished;
    setWished(nextWished);
    setCount((c) => c + (nextWished ? 1 : -1));
    onChange?.(nextWished);
  }, [wished, onChange]);

  return { wished, count, toggle } as const;
};
