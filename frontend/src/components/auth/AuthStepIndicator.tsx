import React from 'react';
import { Icon } from '../common/Icon';

interface AuthStepIndicatorProps {
  readonly steps: readonly string[];
  /** 0부터 시작하는 현재 단계. */
  readonly current: number;
}

/* data-component="AuthStepIndicator" — 아이디·비밀번호 찾기 진행 단계 */
export const AuthStepIndicator: React.FC<AuthStepIndicatorProps> = ({ steps, current }) => (
  <ol aria-label="진행 단계" className="flex items-start mb-8">
    {steps.map((label, index) => {
      const done = index < current;
      const active = index === current;
      return (
        <li className="flex-1 flex flex-col items-center relative" key={label} aria-current={active ? 'step' : undefined}>
          {index > 0 && (
            <span
              aria-hidden="true"
              className={`absolute top-3.5 right-1/2 w-full h-0.5 ${index <= current ? 'bg-primary-container' : 'bg-hairline-strong'}`}
            />
          )}
          <span
            className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              done || active ? 'bg-primary-container text-on-primary' : 'bg-canvas border border-hairline-strong text-muted'
            }`}
          >
            {done ? <Icon className="text-[16px]" name="check" /> : index + 1}
          </span>
          <span className={`mt-1.5 text-xs ${active ? 'text-ink font-bold' : 'text-muted'}`}>{label}</span>
        </li>
      );
    })}
  </ol>
);

export default AuthStepIndicator;
