import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getMySummary } from '../../api/mypage';
import type { MyProfile, MySummary } from '../../api/types';
import { ADMIN_MY_PAGE_TABS, DEFAULT_MY_PAGE_TAB, MY_PAGE_TABS, type MyPageTab } from '../../data/mypage';
import { useAuth } from '../auth/useAuth';

const isTab = (value: string | null, tabs: readonly MyPageTab[]): value is MyPageTab =>
  tabs.includes(value as MyPageTab);

/** 마이페이지 전체 상태: 로그인 확인, 프로필·활동 숫자, 현재 탭(?tab=). */
export const useMyPage = () => {
  const { user, status: authStatus, signIn } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [summary, setSummary] = useState<MySummary | null>(null);
  const [summaryError, setSummaryError] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  // 관리자가 아니면 ?tab=itemReview로 들어와도 기본 탭을 보여준다 (서버도 403으로 막는다).
  const tabs = summary?.profile.role === 'admin' ? ADMIN_MY_PAGE_TABS : MY_PAGE_TABS;
  const tabParam = searchParams.get('tab');
  const tab: MyPageTab = isTab(tabParam, tabs) ? tabParam : DEFAULT_MY_PAGE_TAB;

  useEffect(() => {
    if (authStatus !== 'authenticated') return undefined;
    let cancelled = false;
    setSummaryError(false);
    getMySummary()
      .then((next) => {
        if (!cancelled) setSummary(next);
      })
      .catch(() => {
        if (!cancelled) setSummaryError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [authStatus, reloadToken]);

  /** 찜 해제처럼 숫자가 바뀌는 동작 뒤에 호출한다. */
  const reloadSummary = useCallback(() => setReloadToken((n) => n + 1), []);

  const selectTab = useCallback(
    (next: MyPageTab) => {
      setSearchParams(next === DEFAULT_MY_PAGE_TAB ? {} : { tab: next });
    },
    [setSearchParams],
  );

  /** 닉네임을 바꾼 뒤: 화면 프로필과 헤더(로그인 상태)의 닉네임을 함께 갱신한다. */
  const onProfileUpdated = useCallback(
    (profile: MyProfile) => {
      setSummary((prev) => (prev ? { ...prev, profile } : prev));
      if (user) signIn({ ...user, nickname: profile.nickname });
    },
    [signIn, user],
  );

  return {
    authStatus,
    needsLogin: authStatus === 'guest',
    summary,
    summaryError,
    reloadSummary,
    tabs,
    tab,
    selectTab,
    onProfileUpdated,
  };
};

export default useMyPage;
