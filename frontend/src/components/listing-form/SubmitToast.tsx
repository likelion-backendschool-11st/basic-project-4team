import React from 'react';
import { Icon } from '../common/Icon';

interface SubmitToastProps {
  readonly visible: boolean;
  readonly title: string;
  readonly body: string;
}

/** Bottom-right success toast shown while redirecting after submit. */
export const SubmitToast: React.FC<SubmitToastProps> = ({ visible, title, body }) => (
  <div
    aria-live="polite"
    className={`fixed bottom-6 right-6 left-6 sm:left-auto bg-forest text-on-primary px-space-lg py-space-md rounded shadow-xl flex items-center gap-space-sm transform transition-all z-50 ${
      visible ? 'translate-y-0 opacity-100' : 'translate-y-32 opacity-0 pointer-events-none'
    }`}
  >
    <Icon className="text-lime-ribbon text-[24px] shrink-0" name="task_alt" />
    <div>
      <p className="font-ui-label text-ui-label text-on-primary">{title}</p>
      <p className="font-caption text-caption text-mint-100">{body}</p>
    </div>
  </div>
);

export default SubmitToast;
