import React from 'react';
import { Link } from 'react-router-dom';
import { errorPageCopy as copy, ROUTES } from '../../data/layout';
import { Icon } from './Icon';

interface ErrorPageContentProps {
  readonly variant: 'notFound' | 'crash';
  /** crash: 새로고침 버튼 동작. */
  readonly onReload?: () => void;
}

/** 오류 페이지 본문 (#21) — 404와 화면 오류가 함께 쓴다. */
export const ErrorPageContent: React.FC<ErrorPageContentProps> = ({ variant, onReload }) => {
  const text = copy[variant];
  return (
    <section className="w-full bg-surface-bright">
      <div className="max-w-xl mx-auto px-gutter-desktop py-space-section flex flex-col items-center text-center gap-space-sm">
        <span className="w-16 h-16 rounded-full bg-mint-100 text-forest flex items-center justify-center">
          <Icon className="text-[32px]" name={text.icon} />
        </span>
        <p className="font-eyebrow text-eyebrow text-primary-container tracking-widest">{text.code}</p>
        <h1 className="font-heading-2 text-heading-2 text-ink">{text.title}</h1>
        <p className="font-body-sm text-body-sm text-muted">{text.body}</p>
        <div className="mt-space-sm flex flex-wrap justify-center gap-space-xs">
          <Link
            className="bg-primary-container text-on-primary font-ui-label text-ui-label px-space-md py-2 rounded hover:bg-forest transition-colors flex items-center gap-1"
            to={ROUTES.home}
          >
            <Icon className="text-[18px]" name="home" />
            {copy.homeLabel}
          </Link>
          {variant === 'crash' ? (
            <button
              className="border border-hairline-strong text-ink font-ui-label text-ui-label px-space-md py-2 rounded hover:bg-canvas-soft transition-colors flex items-center gap-1"
              onClick={onReload}
              type="button"
            >
              <Icon className="text-[18px]" name="refresh" />
              {copy.reloadLabel}
            </button>
          ) : (
            <>
              <button
                className="border border-hairline-strong text-ink font-ui-label text-ui-label px-space-md py-2 rounded hover:bg-canvas-soft transition-colors flex items-center gap-1"
                onClick={() => window.history.back()}
                type="button"
              >
                <Icon className="text-[18px]" name="arrow_back" />
                {copy.backLabel}
              </button>
              <Link
                className="border border-hairline-strong text-ink font-ui-label text-ui-label px-space-md py-2 rounded hover:bg-canvas-soft transition-colors flex items-center gap-1"
                to={ROUTES.search}
              >
                <Icon className="text-[18px]" name="search" />
                {copy.searchLabel}
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default ErrorPageContent;
