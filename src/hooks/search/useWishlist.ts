import { useCallback, useState } from 'react';

/** Local wishlist toggle state keyed by listing id. */
export const useWishlist = (initialIds: readonly string[]) => {
  const [ids, setIds] = useState<ReadonlySet<string>>(() => new Set(initialIds));

  const toggle = useCallback((id: string) => {
    setIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return { isWished: (id: string) => ids.has(id), toggle };
};
