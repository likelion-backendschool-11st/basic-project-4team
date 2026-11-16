import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { findLoginId } from '../../api/auth';
import { findIdCopy } from '../../data/auth';
import { isValidEmail, toAuthErrorMessage, type AuthFeedback } from './authFormHelpers';

/** 아이디 찾기 폼. 성공하면 sentTo에 보낸 이메일이 채워진다. */
export const useFindIdForm = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<AuthFeedback | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const onEmailChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setEmailError(undefined);
  }, []);

  const onSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (submitting) return;
      const trimmed = email.trim().toLowerCase();
      if (!isValidEmail(trimmed)) {
        setEmailError(findIdCopy.emailError);
        return;
      }
      setFeedback(null);
      setSubmitting(true);
      try {
        await findLoginId(trimmed);
        if (mounted.current) setSentTo(trimmed);
      } catch (err) {
        if (mounted.current) setFeedback({ kind: 'error', message: toAuthErrorMessage(err) });
      } finally {
        if (mounted.current) setSubmitting(false);
      }
    },
    [email, submitting],
  );

  /** 다른 이메일로 다시 찾기. */
  const reset = useCallback(() => {
    setSentTo(null);
    setEmail('');
  }, []);

  return { email, emailError, submitting, feedback, sentTo, onEmailChange, onSubmit, reset };
};

export default useFindIdForm;
