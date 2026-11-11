import React from 'react';
import { Icon } from '../common/Icon';

interface TestAccountNoticeProps {
  readonly title: string;
  readonly body: string;
}

/* data-component="TestAccountHelper" */
export const TestAccountNotice: React.FC<TestAccountNoticeProps> = ({ title, body }) => (
  <div className="mt-6 p-3 rounded border border-hairline bg-canvas-soft text-xs text-muted flex items-start gap-2">
    <Icon className="text-[16px] text-primary-container shrink-0" name="info" />
    <div>
      <span className="font-semibold text-ink">{title}</span> <span>{body}</span>
    </div>
  </div>
);

export default TestAccountNotice;
