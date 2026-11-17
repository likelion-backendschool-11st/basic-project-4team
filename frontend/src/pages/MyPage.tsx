import React from 'react';
import { Navigate } from 'react-router-dom';
import { AdminItemRequestsPanel } from '../components/item/AdminItemRequestsPanel';
import { MyItemRequestsPanel } from '../components/item/MyItemRequestsPanel';
import { MyCommentsPanel } from '../components/mypage/MyCommentsPanel';
import { MyPageTabs } from '../components/mypage/MyPageTabs';
import { MyPostsPanel } from '../components/mypage/MyPostsPanel';
import { MyProfileCard } from '../components/mypage/MyProfileCard';
import { MyPurchasesPanel } from '../components/mypage/MyPurchasesPanel';
import { MySalesPanel } from '../components/mypage/MySalesPanel';
import { MySettingsPanel } from '../components/mypage/MySettingsPanel';
import { MyWishesPanel } from '../components/mypage/MyWishesPanel';
import type { LoginRedirectState } from '../data/auth';
import { ROUTES } from '../data/layout';
import { myPageCopy } from '../data/mypage';
import { useMyPage } from '../hooks/mypage/useMyPage';

interface MyPageProps {
  readonly className?: string;
}

const LOGIN_STATE: LoginRedirectState = {
  noticeTitle: myPageCopy.loginRequiredTitle,
  noticeMessage: myPageCopy.loginRequiredMessage,
  redirectTo: ROUTES.my,
  noticeKind: 'info',
};

/** 마이페이지 — 프로필·거래 숫자 + 판매/구매/찜/글/댓글/계정 설정 탭. 로그인 필요. */
export const MyPage: React.FC<MyPageProps> = ({ className = '' }) => {
  const page = useMyPage();

  if (page.needsLogin) {
    return <Navigate replace state={LOGIN_STATE} to={ROUTES.login} />;
  }

  const { summary } = page;

  return (
    <div className={`w-full bg-canvas pb-space-section ${className}`}>
      <div className="max-w-7xl mx-auto px-gutter-desktop pt-space-xl">
        <h1 className="font-heading-2 text-heading-2 text-ink mb-space-lg">{myPageCopy.title}</h1>
        {page.summaryError && !summary && (
          <div className="py-24 text-center">
            <p className="font-body-sm text-body-sm text-muted">{myPageCopy.loadError}</p>
            <button
              className="mt-space-sm border border-hairline-strong text-ink font-ui-sm text-ui-sm px-space-md py-2 rounded hover:bg-canvas-soft"
              onClick={page.reloadSummary}
              type="button"
            >
              {myPageCopy.retry}
            </button>
          </div>
        )}
        {!summary && !page.summaryError && (
          <p className="py-24 text-center font-body-sm text-body-sm text-muted">{myPageCopy.loading}</p>
        )}
        {summary && (
          <div className="grid grid-cols-1 lg:grid-cols-[18rem_1fr] gap-space-xl items-start">
            <aside className="lg:sticky lg:top-24">
              <MyProfileCard
                counts={summary.counts}
                onEditProfile={() => page.selectTab('settings')}
                profile={summary.profile}
              />
            </aside>
            <section className="min-w-0">
              <MyPageTabs active={page.tab} counts={summary.counts} onSelect={page.selectTab} tabs={page.tabs} />
              <div className="pt-space-md" role="tabpanel">
                {page.tab === 'sales' && <MySalesPanel />}
                {page.tab === 'purchases' && <MyPurchasesPanel />}
                {page.tab === 'wishes' && <MyWishesPanel onChanged={page.reloadSummary} />}
                {page.tab === 'posts' && <MyPostsPanel />}
                {page.tab === 'comments' && <MyCommentsPanel />}
                {page.tab === 'itemRequests' && <MyItemRequestsPanel />}
                {page.tab === 'itemReview' && <AdminItemRequestsPanel />}
                {page.tab === 'settings' && (
                  <MySettingsPanel onProfileUpdated={page.onProfileUpdated} profile={summary.profile} />
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPage;
