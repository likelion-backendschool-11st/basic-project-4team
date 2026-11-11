import React from 'react';
import type { LoginFeedback } from '../../hooks/auth/useLoginForm';
import { Icon } from '../common/Icon';

interface LoginFeedbackAlertProps {
  readonly feedback: LoginFeedback | null;
}

const kindClasses: Record<LoginFeedback['kind'], string> = {
  error: 'bg-error-container border-error/30 text-on-error-container',
  success: 'bg-mint-50 border-primary-container/30 text-primary-deep font-medium',
  info: 'bg-canvas-soft border-hairline-strong text-ink',
};

export const LoginFeedbackAlert: React.FC<LoginFeedbackAlertProps> = ({ feedback }) => (
  <div aria-live="assertive" role="alert">
    {feedback && (
      <div className={`mb-6 p-3.5 rounded text-sm border transition-all duration-200 ${kindClasses[feedback.kind]}`}>
        {feedback.kind === 'success' ? (
          <div className="flex items-center gap-2">
            <Icon className="text-[16px] text-primary-container shrink-0" filled name="check_circle" />
            <span>
              <strong>{feedback.title}</strong> {feedback.message}
            </span>
          </div>
        ) : (
          feedback.message
        )}
      </div>
    )}
  </div>
);

export default LoginFeedbackAlert;
