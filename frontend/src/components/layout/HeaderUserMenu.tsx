import React from 'react';
import { Link } from 'react-router-dom';
import type { User } from '../../api/types';
import type { AuthStatus } from '../../hooks/auth/authContext';
import { headerData, ROUTES } from '../../data/layout';
import { Icon } from '../common/Icon';

interface HeaderUserMenuProps {
  readonly user: User | null;
  readonly status: AuthStatus;
  readonly loggingOut: boolean;
  readonly onLogout: () => void;
}

/** 헤더 우측: 로그인 확인 중이면 자리만, 비로그인이면 로그인 링크, 로그인이면 닉네임 + 로그아웃. */
export const HeaderUserMenu: React.FC<HeaderUserMenuProps> = ({ user, status, loggingOut, onLogout }) => {
  if (status === 'loading') {
    return <span aria-hidden className="w-8 h-8 rounded-[9999px] bg-canvas-soft ml-space-xs" />;
  }

  if (!user) {
    return (
      <Link
        className="ml-space-xs border border-hairline-strong text-ink font-ui-label text-ui-label px-space-md py-2 rounded hover:bg-canvas-soft transition-colors flex items-center gap-1"
        to={ROUTES.login}
      >
        <Icon className="text-[18px]" name="login" />
        <span>{headerData.loginLabel}</span>
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-space-xs pl-space-xs">
      <span className="flex items-center gap-space-xs" title={user.loginId}>
        <span className="w-8 h-8 rounded-[9999px] bg-primary flex items-center justify-center">
          <Icon className="text-on-primary text-[18px]" name="person" />
        </span>
        <span className="hidden md:inline font-ui-sm text-ui-sm text-ink max-w-[8rem] truncate">
          {headerData.nicknameSuffix(user.nickname)}
        </span>
      </span>
      <button
        className="p-2 rounded hover:bg-canvas-soft text-body hover:text-ink transition-colors flex items-center gap-1 font-ui-sm text-ui-sm disabled:opacity-50"
        disabled={loggingOut}
        onClick={onLogout}
        type="button"
      >
        <Icon className="text-[20px]" name="logout" />
        <span className="hidden md:inline">{loggingOut ? headerData.loggingOutLabel : headerData.logoutLabel}</span>
      </button>
    </div>
  );
};

export default HeaderUserMenu;
