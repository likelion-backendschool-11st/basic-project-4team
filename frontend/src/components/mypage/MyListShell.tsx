import React from 'react';
import { myListCopy } from '../../data/mypage';
import type { PagedListStatus } from '../../hooks/mypage/usePagedList';
import { Icon } from '../common/Icon';
import { Pagination } from '../search/Pagination';

interface MyListShellProps {
  readonly status: PagedListStatus;
  readonly totalCount: number;
  readonly itemCount: number;
  readonly page: number;
  readonly pages: readonly number[];
  readonly hasPrev: boolean;
  readonly hasNext: boolean;
  readonly onPage: (page: number) => void;
  readonly onPrev: () => void;
  readonly onNext: () => void;
  readonly onRetry: () => void;
  /** 목록이 비었을 때 보여줄 내용. */
  readonly empty: React.ReactNode;
  /** 목록 위 도구(필터 등). */
  readonly toolbar?: React.ReactNode;
  readonly children: React.ReactNode;
}

/** 마이페이지 목록 공통 틀: 로딩·오류·빈 목록·페이지 이동. */
export const MyListShell: React.FC<MyListShellProps> = ({
  status,
  totalCount,
  itemCount,
  page,
  pages,
  hasPrev,
  hasNext,
  onPage,
  onPrev,
  onNext,
  onRetry,
  empty,
  toolbar,
  children,
}) => {
  const firstLoad = status === 'loading' && itemCount === 0;
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-space-sm mb-space-sm">
        {toolbar ?? <span />}
        <span className="font-caption text-caption text-muted">{myListCopy.total(totalCount)}</span>
      </div>
      {status === 'error' && (
        <div className="py-12 flex flex-col items-center gap-space-sm text-center">
          <Icon className="text-[28px] text-error" name="error" />
          <p className="font-body-sm text-body-sm text-muted">{myListCopy.error}</p>
          <button
            className="border border-hairline-strong text-ink font-ui-sm text-ui-sm px-space-md py-2 rounded hover:bg-canvas-soft transition-colors"
            onClick={onRetry}
            type="button"
          >
            {myListCopy.retry}
          </button>
        </div>
      )}
      {firstLoad && <p className="py-16 text-center font-body-sm text-body-sm text-muted">{myListCopy.loading}</p>}
      {status !== 'error' && !firstLoad && itemCount === 0 && empty}
      {status !== 'error' && itemCount > 0 && (
        <>
          {/* 페이지를 넘길 때는 이전 목록을 흐리게 남겨 화면이 출렁이지 않게 한다 */}
          <ul className={`border-t border-hairline transition-opacity ${status === 'loading' ? 'opacity-50' : ''}`}>{children}</ul>
          {pages.length > 1 && (
            <div className="mt-space-md">
              <Pagination
                hasNext={hasNext}
                hasPrev={hasPrev}
                navAria={myListCopy.navAria}
                nextAria={myListCopy.nextAria}
                onNext={onNext}
                onPage={onPage}
                onPrev={onPrev}
                page={page}
                pages={pages}
                prevAria={myListCopy.prevAria}
                summary={myListCopy.total(totalCount)}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyListShell;
