import React from 'react';
import { Link } from 'react-router-dom';
import { findIdCopy, type LoginRedirectState } from '../../data/auth';
import { ROUTES } from '../../data/layout';
import { Icon } from '../common/Icon';
import { AuthSecondaryAction } from './AuthSecondaryAction';

interface FindIdResultPanelProps {
  readonly loginId: string;
  /** 가입 시각 (ISO). */
  readonly createdAt: string;
}

/* data-component="FindIdResultPanel" — 인증 완료 후 찾은 아이디 표시 */
export const FindIdResultPanel: React.FC<FindIdResultPanelProps> = ({ loginId, createdAt }) => {
  const loginState: LoginRedirectState = {
    loginId,
    noticeTitle: findIdCopy.foundTitle,
    noticeMessage: findIdCopy.foundMessage,
  };
  return (
    <div className="space-y-6">
      <div className="p-6 rounded border border-primary-container/30 bg-mint-50 text-center">
        <Icon className="text-[32px] text-primary-container" filled name="verified_user" />
        <p className="mt-2 text-sm text-muted">{findIdCopy.resultLabel}</p>
        <p className="mt-1 text-2xl font-bold text-ink tracking-tight break-all">{loginId}</p>
        <p className="mt-2 text-xs text-muted">{findIdCopy.joinedAt(new Date(createdAt).toLocaleDateString('ko-KR'))}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <AuthSecondaryAction label={findIdCopy.toFindPassword} to={ROUTES.findPassword} />
        <Link
          className="w-full bg-primary-container hover:bg-primary-deep text-on-primary font-bold py-3.5 px-4 rounded text-base transition-colors duration-150 flex items-center justify-center shadow-sm"
          replace
          state={loginState}
          to={ROUTES.login}
        >
          {findIdCopy.toLogin}
        </Link>
      </div>
    </div>
  );
};

export default FindIdResultPanel;
