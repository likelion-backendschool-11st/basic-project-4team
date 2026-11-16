import React from 'react';
import { Link } from 'react-router-dom';
import { brand, headerData, navItems, ROUTES } from '../../data/layout';
import { useHeaderAuth } from '../../hooks/layout/useHeaderAuth';
import { useNotifications } from '../../hooks/layout/useNotifications';
import { useWishlistDrawer } from '../../hooks/layout/useWishlistDrawer';
import { useActiveRoute } from '../../hooks/useActiveRoute';
import { useHeaderSearch } from '../../hooks/useHeaderSearch';
import { Icon } from '../common/Icon';
import { CategoryMenu } from './CategoryMenu';
import { HeaderCountBadge } from './HeaderCountBadge';
import { HeaderUserMenu } from './HeaderUserMenu';
import { NoticeBar } from './NoticeBar';
import { NotificationMenu } from './NotificationMenu';
import { WishlistDrawer } from './WishlistDrawer';

interface HeaderProps {
  readonly showNotice?: boolean;
}

/* data-component="GNB" */
export const Header: React.FC<HeaderProps> = ({ showNotice = true }) => {
  const isActive = useActiveRoute();
  const { query, setQuery, onSubmit } = useHeaderSearch();
  const headerAuth = useHeaderAuth();
  const notifications = useNotifications();
  const wishlist = useWishlistDrawer();
  // 판매는 로그인 회원만 (REQ-HEADER-003). 로그인 확인 중에는 판매 화면으로 둔다.
  const sellTo = headerAuth.status === 'guest' ? ROUTES.login : ROUTES.sell;

  return (
    <header className="sticky top-0 left-0 w-full z-50 bg-canvas">
      {showNotice && <NoticeBar />}
      <div className="bg-canvas border-b border-hairline">
        <div className="h-16 max-w-7xl mx-auto px-gutter-desktop flex items-center justify-between gap-space-lg">
          <Link className="flex items-center gap-space-xs shrink-0" to={ROUTES.home}>
            <img alt={brand.logoAlt} className="h-8 w-auto object-contain" src={brand.logoSrc} />
          </Link>

          <form className="flex-1 max-w-2xl" onSubmit={onSubmit} role="search">
            <div className="flex items-center w-full bg-canvas-soft border border-hairline-strong rounded px-space-sm py-space-xs">
              <Icon className="text-outline text-[20px] mr-space-xs" name="search" />
              <input
                className="w-full bg-transparent border-0 p-0 font-body-sm text-body-sm text-ink placeholder:text-muted focus:outline-none focus:ring-0"
                onChange={(e) => setQuery(e.target.value)}
                placeholder={headerData.searchPlaceholder}
                type="text"
                value={query}
              />
              <span className="hidden sm:inline font-micro text-micro bg-canvas text-muted px-1.5 py-0.5 border border-hairline rounded mr-space-xs">
                {headerData.enterHint}
              </span>
              <button
                className="bg-primary-container text-on-primary font-ui-label text-ui-label px-space-md py-1 rounded hover:bg-forest transition-colors shrink-0"
                type="submit"
              >
                {headerData.searchLabel}
              </button>
            </div>
          </form>

          <div className="flex items-center gap-space-sm shrink-0">
            <Link
              className="bg-primary-container text-on-primary font-ui-label text-ui-label px-space-md py-2 rounded hover:bg-forest transition-colors flex items-center gap-1"
              to={sellTo}
            >
              <Icon className="text-[18px]" name="add" />
              <span>{headerData.sellLabel}</span>
            </Link>
            {/* 채팅 API가 아직 없어 숫자 없이 둔다 (REQ-HEADER-004). */}
            <button
              aria-disabled="true"
              className="relative p-2 rounded text-muted cursor-not-allowed hidden md:flex items-center gap-1 font-ui-sm text-ui-sm"
              title={headerData.chatSoon}
              type="button"
            >
              <Icon className="text-[20px]" name="chat_bubble" />
              <span>{headerData.chatLabel}</span>
            </button>
            <NotificationMenu state={notifications} />
            <HeaderUserMenu
              loggingOut={headerAuth.loggingOut}
              onLogout={headerAuth.onLogout}
              status={headerAuth.status}
              user={headerAuth.user}
            />
          </div>
        </div>
      </div>

      <div className="relative bg-canvas border-b border-hairline">
        <div className="h-11 max-w-7xl mx-auto px-gutter-desktop flex items-center gap-space-lg">
          <CategoryMenu className="shrink-0" />
          <span aria-hidden className="h-4 w-px bg-hairline shrink-0" />
          <nav className="flex items-center gap-space-lg h-full overflow-x-auto no-scrollbar">
            {navItems.map((item) => {
              const content = (
                <>
                  {item.icon && <Icon className="text-[18px]" name={item.icon} />}
                  <span>{item.label}</span>
                </>
              );
              if (item.action === 'wishlist') {
                return (
                  <button
                    aria-expanded={wishlist.open}
                    className="h-full flex items-center gap-1 whitespace-nowrap font-ui-label text-ui-label text-on-surface-variant hover:text-on-surface transition-colors"
                    key={item.label}
                    onClick={wishlist.openDrawer}
                    type="button"
                  >
                    {content}
                    <HeaderCountBadge count={wishlist.totalCount ?? 0} tone="soft" />
                  </button>
                );
              }
              const active = isActive(item.to);
              return (
                <Link
                  aria-current={active ? 'page' : undefined}
                  className={`h-full flex items-center gap-1 whitespace-nowrap font-ui-label text-ui-label transition-colors ${
                    active
                      ? 'text-primary-container border-b-2 border-primary-container'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                  key={item.label}
                  to={item.to}
                >
                  {content}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
      <WishlistDrawer state={wishlist} />
    </header>
  );
};

export default Header;
