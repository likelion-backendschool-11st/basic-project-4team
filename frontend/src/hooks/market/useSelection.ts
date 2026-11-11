import { useState } from 'react';

/** Single-select tab/pill state (category tab, grade pill, sub-option pill). */
export const useSelection = <T extends string>(initial: T) => {
  const [selected, setSelected] = useState<T>(initial);
  return { selected, select: setSelected, isSelected: (id: T) => id === selected };
};
