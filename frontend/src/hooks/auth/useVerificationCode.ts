import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { VerificationRequestResponse } from '../../api/auth';
import { AUTH_RULES, verificationCopy } from '../../data/auth';
import { toAuthErrorMessage, type AuthFeedback } from './authFormHelpers';
import { useCountdown } from './useCountdown';

interface UseVerificationCodeOptions<T> {
  /** 인증코드 (재)발송 요청. */
  readonly request: () => Promise<VerificationRequestResponse>;
  /** 입력한 코드 확인. 성공하면 결과를 onVerified로 넘긴다. */
  readonly verify: (code: string) => Promise<T>;
  readonly onVerified: (result: T) => void;
  readonly setFeedback: (feedback: AuthFeedback | null) => void;
}

/** 인증코드 입력 단계 공통 로직: 코드 입력, 확인, 다시 받기(대기 시간), 만료 카운트다운. */
export const useVerificationCode = <T>({ request, verify, onVerified, setFeedback }: UseVerificationCodeOptions<T>) => {
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string | undefined>();
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const { remaining: resendIn, running: resendWaiting, start: startResendTimer } = useCountdown();
  const { remaining: expiresIn, running: codeAlive, start: startExpiryTimer, stop: stopExpiryTimer } = useCountdown();
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  /** 요청 응답을 받은 직후 호출: 입력값을 비우고 타이머를 시작한다. */
  const begin = useCallback(
    (response: VerificationRequestResponse) => {
      setCode('');
      setCodeError(undefined);
      startResendTimer(response.resendAfterSeconds);
      startExpiryTimer(response.expiresInSeconds);
    },
    [startExpiryTimer, startResendTimer],
  );

  const onCodeChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    // 숫자만, 최대 6자리 (메일에서 붙여넣을 때 공백·하이픈이 섞여도 처리)
    setCode(e.target.value.replace(/\D/g, '').slice(0, AUTH_RULES.verificationCodeLength));
    setCodeError(undefined);
  }, []);

  const onSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (verifying) return;
      if (!AUTH_RULES.verificationCodePattern.test(code)) {
        setCodeError(verificationCopy.codeError);
        return;
      }
      if (!codeAlive) {
        setFeedback({ kind: 'error', message: verificationCopy.expired });
        return;
      }
      setVerifying(true);
      try {
        const result = await verify(code);
        if (!mounted.current) return;
        stopExpiryTimer();
        onVerified(result);
      } catch (err) {
        if (!mounted.current) return;
        setCode('');
        setFeedback({ kind: 'error', message: toAuthErrorMessage(err) });
      } finally {
        if (mounted.current) setVerifying(false);
      }
    },
    [code, codeAlive, onVerified, setFeedback, stopExpiryTimer, verify, verifying],
  );

  const resend = useCallback(async () => {
    if (resending || resendWaiting) return;
    setResending(true);
    try {
      const response = await request();
      if (!mounted.current) return;
      begin(response);
      setFeedback({ kind: 'info', message: verificationCopy.resent });
    } catch (err) {
      if (mounted.current) setFeedback({ kind: 'error', message: toAuthErrorMessage(err) });
    } finally {
      if (mounted.current) setResending(false);
    }
  }, [begin, request, resendWaiting, resending, setFeedback]);

  return {
    code,
    codeError,
    verifying,
    resending,
    resendIn,
    expiresIn,
    begin,
    onCodeChange,
    onSubmit,
    resend,
  };
};

export type VerificationCodeState = ReturnType<typeof useVerificationCode>;

export default useVerificationCode;
