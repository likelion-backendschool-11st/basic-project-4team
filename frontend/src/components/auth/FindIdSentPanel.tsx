import React from 'react';
import { Link } from 'react-router-dom';
import { findIdCopy } from '../../data/auth';
import { ROUTES } from '../../data/layout';
import { Icon } from '../common/Icon';
import { AuthSecondaryAction } from './AuthSecondaryAction';

interface FindIdSentPanelProps {
  readonly email: string;
  readonly onRetry: () => void;
}

/* data-component="FindIdSentPanel" — 아이디 안내 메일을 보낸 뒤 화면 */
export const FindIdSentPanel: React.FC<FindIdSentPanelProps> = ({ email, onRetry }) => (
  <div className="space-y-6">
    <div className="p-4 rounded border border-primary-container/30 bg-mint-50 text-sm text-ink flex items-start gap-2.5">
      <Icon className="text-[20px] text-primary-container shrink-0" filled name="mark_email_read" />
      <div className="space-y-1">
        <strong className="block text-primary-deep">{findIdCopy.sentTitle}</strong>
        <p className="text-body leading-relaxed break-keep [overflow-wrap:anywhere]">{findIdCopy.sentMessage(email)}</p>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <AuthSecondaryAction label={findIdCopy.retry} onClick={onRetry} />
      <Link
        className="w-full bg-primary-container hover:bg-primary-deep text-on-primary font-bold py-3.5 px-4 rounded text-base transition-colors duration-150 flex items-center justify-center shadow-sm"
        to={ROUTES.login}
      >
        {findIdCopy.toLogin}
      </Link>
    </div>
    <p className="text-center text-sm">
      <Link className="text-link font-bold hover:text-primary-container transition-colors" to={ROUTES.findPassword}>
        {findIdCopy.toFindPassword}
      </Link>
    </p>
  </div>
);

export default FindIdSentPanel;
