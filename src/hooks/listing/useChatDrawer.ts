import { useCallback, useState } from 'react';

/** 1:1 chat drawer: open state, draft input, quick replies, send. */
export const useChatDrawer = (onSend?: (message: string) => void) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');

  const openDrawer = useCallback(() => setOpen(true), []);
  const closeDrawer = useCallback(() => setOpen(false), []);
  const insertQuick = useCallback((text: string) => setDraft(text), []);
  const send = useCallback(() => {
    if (draft.trim() === '') return;
    onSend?.(draft);
    setDraft('');
  }, [draft, onSend]);

  return { open, draft, setDraft, openDrawer, closeDrawer, insertQuick, send } as const;
};
