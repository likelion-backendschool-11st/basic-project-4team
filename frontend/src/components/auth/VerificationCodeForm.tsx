import React from 'react';
import { verificationCopy } from '../../data/auth';
import { formatMinSec } from '../../hooks/auth/useCountdown';
import { Icon } from '../common/Icon';
import { AuthSecondaryAction } from './AuthSecondaryAction';
import { FormField } from './FormField';
import { SubmitButton } from './SubmitButton';

interface VerificationCodeFormProps {
  readonly code: string;
  readonly codeError?: string;
  readonly verifying: boolean;
  readonly resending: boolean;
  /** 다시 받기까지 남은 초. 0이면 바로 가능. */
  readonly resendIn: number;
  /** 코드 만료까지 남은 초. 0이면 만료. */
  readonly expiresIn: number;
  readonly onCodeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readonly onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  readonly onResend: () => void;
  readonly onBack: () => void;
}

/* data-component="VerificationCodeForm" — 메일로 받은 6자리 인증코드 입력 (아이디·비밀번호 찾기 공통).
   maxLength를 두지 않는다: "123 456"처럼 붙여넣어도 훅에서 숫자만 6자리로 잘라 쓴다. */
export const VerificationCodeForm: React.FC<VerificationCodeFormProps> = ({
  code,
  codeError,
  verifying,
  resending,
  resendIn,
  expiresIn,
  onCodeChange,
  onSubmit,
  onResend,
  onBack,
}) => {
  const expired = expiresIn === 0;
  return (
    <form className="space-y-5" id="verificationCodeForm" noValidate onSubmit={onSubmit}>
      <div>
        <FormField
          autoComplete="one-time-code"
          errorText={codeError ?? ''}
          hasError={Boolean(codeError)}
          id="verificationCode"
          inputMode="numeric"
          label={verificationCopy.codeLabel}
          name="code"
          onChange={onCodeChange}
          placeholder={verificationCopy.codePlaceholder}
          trailing={
            <span
              className={`absolute inset-y-0 right-0 pr-3.5 flex items-center text-sm font-bold tabular-nums ${
                expired ? 'text-error' : 'text-primary-container'
              }`}
            >
              {expired ? verificationCopy.expiredShort : formatMinSec(expiresIn)}
            </span>
          }
          type="text"
          value={code}
        />
        <p className="mt-2 text-xs text-muted flex items-start gap-1">
          <Icon className="text-[14px] shrink-0 mt-px" name="mail" />
          <span className="break-keep">{verificationCopy.spamHint}</span>
        </p>
      </div>
      <div className="space-y-3 pt-1">
        <SubmitButton label={verificationCopy.submit} loading={verifying} loadingLabel={verificationCopy.submitting} />
        <AuthSecondaryAction
          disabled={resending || resendIn > 0}
          label={resendIn > 0 ? verificationCopy.resendWait(resendIn) : verificationCopy.resend}
          onClick={onResend}
        />
      </div>
      <p className="text-center text-sm">
        <button className="text-muted hover:text-ink font-medium transition-colors" onClick={onBack} type="button">
          {verificationCopy.back}
        </button>
      </p>
    </form>
  );
};

export default VerificationCodeForm;
