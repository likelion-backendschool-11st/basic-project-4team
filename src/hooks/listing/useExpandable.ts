import { useCallback, useState } from 'react';

/** Boolean expand/collapse toggle (e.g. "상품 설명 더보기"). */
export const useExpandable = (initial = false) => {
  const [expanded, setExpanded] = useState(initial);
  const toggle = useCallback(() => setExpanded((v) => !v), []);
  return { expanded, toggle } as const;
};
