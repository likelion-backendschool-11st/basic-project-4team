import { useCallback, useState } from 'react';

/** Boolean toggle (bookmark, follow, etc.). */
export const useToggle = (initial = false) => {
  const [value, setValue] = useState(initial);
  const toggle = useCallback(() => setValue((v) => !v), []);
  return [value, toggle] as const;
};
