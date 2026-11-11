import { useCallback, useState } from 'react';

/** Textarea composer state with optional max length; submit hands trimmed text upward and clears. */
export const useComposer = (onSubmit: (text: string) => void, maxLength?: number) => {
  const [text, setTextState] = useState('');

  const setText = useCallback(
    (value: string) => setTextState(maxLength ? value.slice(0, maxLength) : value),
    [maxLength],
  );

  const canSubmit = text.trim().length > 0;

  const submit = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return false;
    onSubmit(trimmed);
    setTextState('');
    return true;
  }, [text, onSubmit]);

  return { text, setText, length: text.length, canSubmit, submit };
};
