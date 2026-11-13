import { useCallback, useState } from 'react';
import type { FormEvent } from 'react';

/** 댓글 입력창. 등록에 성공했을 때만 입력값을 비운다 (실패하면 쓰던 내용 유지). */
export const useCommentForm = (onSubmit: (body: string) => Promise<boolean>, maxLength: number) => {
  const [text, setTextState] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const setText = useCallback((value: string) => setTextState(value.slice(0, maxLength)), [maxLength]);

  const canSubmit = text.trim().length > 0 && !submitting;

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      const body = text.trim();
      if (!body || submitting) return;
      setSubmitting(true);
      const ok = await onSubmit(body);
      setSubmitting(false);
      if (ok) setTextState('');
    },
    [text, submitting, onSubmit],
  );

  return { text, setText, canSubmit, submitting, handleSubmit };
};
