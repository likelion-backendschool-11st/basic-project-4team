import { useCallback, useState } from 'react';

/** Open/close state for the category explorer panel (open by default, as in the design). */
export const useCategoryPanel = (initialOpen = true) => {
  const [open, setOpen] = useState(initialOpen);
  const toggle = useCallback(() => setOpen((v) => !v), []);
  return { open, toggle };
};

export default useCategoryPanel;
