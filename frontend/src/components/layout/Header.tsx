import React from 'react';
import { Link } from 'react-router-dom';
import { brand, headerData, liveTicker, navItems, ROUTES } from '../../data/layout';
import { useActiveRoute } from '../../hooks/useActiveRoute';
import { useHeaderSearch } from '../../hooks/useHeaderSearch';
import { Icon } from '../common/Icon';
import { NoticeBar } from './NoticeBar';

interface HeaderProps {
  readonly showNotice?: boolean;
}

/* data-component="GNB" */
export const Header: React.FC<HeaderProps> = ({ showNotice = true }) => {
  const isActive = useActiveRoute();
  const { query, setQuery, onSubmit } = useHeaderSearch();

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
              to={ROUTES.sell}
            >
              <Icon className="text-[18px]" name="add" />
              <span>{headerData.sellLabel}</span>
            </Link>
            <button className="relative p-2 rounded hover:bg-canvas-soft text-body hover:text-ink transition-colors hidden md:flex items-center gap-1 font-ui-sm text-ui-sm" type="button">
              <Icon className="text-[20px]" name="chat_bubble" />
              <span>{headerData.chatLabel}</span>
              <span className="bg-error text-on-error font-micro text-micro px-1.5 rounded-full">{headerData.chatCount}</span>
            </button>
            <button className="relative p-2 rounded hover:bg-canvas-soft text-body hover:text-ink transition-colors hidden md:flex items-center gap-1 font-ui-sm text-ui-sm" type="button">
              <Icon className="text-[20px]" name="notifications" />
              <span>{headerData.alertLabel}</span>
              <span className="bg-primary-container text-on-primary font-micro text-micro px-1.5 rounded-full">{headerData.alertCount}</span>
            </button>
            <Link className="flex items-center gap-space-xs pl-space-xs" to={ROUTES.login}>
              <span className="hidden md:inline font-ui-sm text-ui-sm text-body">{headerData.myLabel}</span>
              <span className="w-8 h-8 rounded-[9999px] bg-primary flex items-center justify-center">
                <Icon className="text-on-primary text-[18px]" name="person" />
              </span>
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-canvas border-b border-hairline">
        <div className="h-11 max-w-7xl mx-auto px-gutter-desktop flex items-center justify-between gap-space-md">
          <nav className="flex items-center gap-space-lg h-full overflow-x-auto no-scrollbar">
            {navItems.map((item) => {
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
                  {item.icon && <Icon className="text-[18px]" name={item.icon} />}
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="bg-mint-100 text-forest font-micro text-micro px-1.5 py-0.5 rounded">{item.badge}</span>
                  )}
                </Link>
              );
            })}
          </nav>
          <div className="hidden lg:flex items-center gap-space-xs font-caption text-caption bg-mint-50 px-space-sm py-1 rounded border border-mint-200 shrink-0">
            <span className="font-eyebrow text-eyebrow text-primary-container">{liveTicker.label}</span>
            <span className="text-faint">:</span>
            <span className="text-ink font-ui-sm text-ui-sm">{liveTicker.item}</span>
            <span className="text-error font-ui-label text-ui-label flex items-center">
              <Icon className="text-[14px]" name="arrow_drop_up" />
              {liveTicker.change}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
