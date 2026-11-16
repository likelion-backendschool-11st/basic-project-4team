import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { requestFindId, verifyFindId, type FindIdResult } from '../../api/auth';
import { findIdCopy, verificationCopy } from '../../data/auth';
import { isValidEmail, toAuthErrorMessage, type AuthFeedback } from './authFormHelpers';
import { useVerificationCode } from './useVerificationCode';

/** request: 이메일 입력 → verify: 인증코드 입력 → done: 아이디 표시 */
export type FindIdStep = 'request' | 'verify' | 'done';

const STEP_INDEX: Readonly<Record<FindIdStep, number>> = { request: 0, verify: 1, done: 2 };

/** 아이디 찾기 3단계 폼. */
export const useFindIdForm = () => {
  const [step, setStep] = useState<FindIdStep>('request');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<AuthFeedback | null>(null);
  const [result, setResult] = useState<FindIdResult | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const normalizedEmail = email.trim().toLowerCase();

  const verification = useVerificationCode<FindIdResult>({
    request: useCallback(() => requestFindId(normalizedEmail), [normalizedEmail]),
    verify: useCallback((code: string) => verifyFindId({ email: normalizedEmail, code }), [normalizedEmail]),
    onVerified: useCallback((found: FindIdResult) => {
      setResult(found);
      setFeedback(null);
      setStep('done');
    }, []),
    setFeedback,
  });
  const { begin } = verification;

  const onEmailChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setEmailError(undefined);
  }, []);

  const onRequestSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (submitting) return;
      if (!isValidEmail(normalizedEmail)) {
        setEmailError(findIdCopy.emailError);
        return;
      }
      setFeedback(null);
      setSubmitting(true);
      try {
        const response = await requestFindId(normalizedEmail);
        if (!mounted.current) return;
        begin(response);
        setStep('verify');
        setFeedback({ kind: 'info', message: verificationCopy.sentNotice(normalizedEmail) });
      } catch (err) {
        if (mounted.current) setFeedback({ kind: 'error', message: toAuthErrorMessage(err) });
      } finally {
        if (mounted.current) setSubmitting(false);
      }
    },
    [begin, normalizedEmail, submitting],
  );

  /** 이메일 입력 단계로 돌아간다. */
  const backToRequest = useCallback(() => {
    setStep('request');
    setFeedback(null);
  }, []);

  return {
    step,
    stepIndex: STEP_INDEX[step],
    email,
    emailError,
    submitting,
    feedback,
    result,
    verification,
    onEmailChange,
    onRequestSubmit,
    backToRequest,
  };
};

export default useFindIdForm;
