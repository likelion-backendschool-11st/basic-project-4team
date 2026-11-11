import { useCallback } from 'react';

/** Copies the current page URL to the clipboard and reports the outcome. */
export const useCopyUrl = (onDone?: (copied: boolean) => void) =>
  useCallback(() => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(
        () => onDone?.(true),
        () => onDone?.(false),
      );
    } else {
      onDone?.(false);
    }
  }, [onDone]);
