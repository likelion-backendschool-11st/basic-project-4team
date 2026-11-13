import { useCallback, useState } from 'react';

/** 글 카드의 수정 모드 상태. save는 onSave가 성공(true)하면 수정 모드를 닫는다. */
export const usePostEditor = (initialBody: string, onSave: (body: string) => Promise<boolean>) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initialBody);
  const [saving, setSaving] = useState(false);

  const start = useCallback(() => {
    setDraft(initialBody);
    setEditing(true);
  }, [initialBody]);

  const cancel = useCallback(() => setEditing(false), []);

  const canSave = draft.trim().length > 0 && draft.trim() !== initialBody && !saving;

  const save = useCallback(async () => {
    const trimmed = draft.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    const ok = await onSave(trimmed);
    setSaving(false);
    if (ok) setEditing(false);
  }, [draft, saving, onSave]);

  return { editing, draft, setDraft, canSave, saving, start, cancel, save };
};
