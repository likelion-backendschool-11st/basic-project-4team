import { useEffect, useState } from 'react';
import { getListingLimit, getMarketPrice, type MarketPriceFilter } from '../../api/newsubscriber';
import type { Grade, GradingService, ListingLimit } from '../../api/types';
import { FRAUD_THRESHOLD_RATIO, pricingCopy, type ListingAttributes } from '../../data/listingForm';
import { useAuth } from '../auth/useAuth';

/** idle: 품목 선택 전. */
export type MarketStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface PricePolicy {
  readonly marketStatus: MarketStatus;
  /** 최근 30일 평균 체결가. 거래가 없거나 불러오기 전이면 null. */
  readonly marketPrice: number | null;
  readonly tradeCount: number;
  readonly days: number;
  /** 저가 경고 기준 비율 — 서버 설정값(응답 전에는 기본값). */
  readonly lowPriceRatio: number;
  /** 신규 가입자 제한. 비로그인이거나 불러오기 전이면 null. */
  readonly limit: ListingLimit | null;
}

const DEFAULT_DAYS = 30;

interface MarketState {
  readonly key: string;
  readonly status: Exclude<MarketStatus, 'idle' | 'loading'>;
  readonly price: number | null;
  readonly tradeCount: number;
  readonly days: number;
  readonly ratio: number;
}

/** 폼 속성 → ITEM-04 시세 필터. 그레이딩은 그레이딩사·등급을 모두 골랐을 때만 함께 보낸다. */
const toFilter = ({ condition, gradingService, grade }: ListingAttributes): MarketPriceFilter =>
  condition === 'graded' && gradingService && grade
    ? { condition, gradingService: gradingService as GradingService, grade: grade as Grade }
    : { condition };

/**
 * 판매글 등록·수정의 가격 기준 (#54).
 * - 선택한 품목·상태·등급의 시세(ITEM-04)와 저가 경고 기준 (REQ-POST-012·013)
 * - 로그인한 회원의 신규 가입자 고가 등록 제한 (REQ-POST-018)
 */
export const usePricePolicy = (itemId: number | null, attributes: ListingAttributes): PricePolicy => {
  const { condition, gradingService, grade } = toFilter(attributes);
  const key = itemId === null ? '' : `${itemId}|${condition}|${gradingService ?? ''}|${grade ?? ''}`;
  const [market, setMarket] = useState<MarketState | null>(null);

  useEffect(() => {
    if (itemId === null) return undefined;
    let cancelled = false;
    getMarketPrice(itemId, { condition, gradingService, grade })
      .then((res) => {
        if (!cancelled) {
          setMarket({ key, status: 'ready', price: res.averagePrice, tradeCount: res.tradeCount, days: res.days, ratio: res.lowPriceRatio });
        }
      })
      .catch(() => {
        if (!cancelled) setMarket({ key, status: 'error', price: null, tradeCount: 0, days: DEFAULT_DAYS, ratio: FRAUD_THRESHOLD_RATIO });
      });
    return () => {
      cancelled = true;
    };
  }, [key, itemId, condition, gradingService, grade]);

  const { status: authStatus, user } = useAuth();
  const userId = authStatus === 'authenticated' ? user?.id ?? null : null;
  const [limit, setLimit] = useState<{ readonly userId: number; readonly value: ListingLimit } | null>(null);

  useEffect(() => {
    if (userId === null) return undefined;
    let cancelled = false;
    getListingLimit()
      .then((value) => {
        if (!cancelled) setLimit({ userId, value });
      })
      // 안내용이라 실패해도 화면은 그대로 쓴다. 제한은 서버가 등록 때 다시 검사한다.
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // 응답이 지금 선택과 다르면(품목·상태를 바꾸는 중) 아직 불러오는 중으로 본다.
  const current = market && market.key === key ? market : null;
  return {
    marketStatus: itemId === null ? 'idle' : current ? current.status : 'loading',
    marketPrice: current?.price ?? null,
    tradeCount: current?.tradeCount ?? 0,
    days: current?.days ?? DEFAULT_DAYS,
    lowPriceRatio: market?.ratio ?? FRAUD_THRESHOLD_RATIO,
    limit: limit && limit.userId === userId ? limit.value : null,
  };
};

const formatWonText = (n: number): string => `${n.toLocaleString('ko-KR')}${pricingCopy.currency}`;

/** 시세 칸에 보여줄 문구 — 금액 또는 상태(품목 선택 전·확인 중·거래 없음·오류). */
export const toMarketText = (policy: PricePolicy): string => {
  const m = pricingCopy.market;
  if (policy.marketStatus === 'idle') return m.noItem;
  if (policy.marketStatus === 'loading') return m.loading;
  if (policy.marketStatus === 'error') return m.error;
  return policy.marketPrice === null ? m.noTrade : formatWonText(policy.marketPrice);
};

export interface NewUserNotice {
  readonly body: string;
  /** 입력 가격이 제한 이상일 때 보여줄 문구. 괜찮으면 null. */
  readonly overMessage: string | null;
}

/** 신규 가입자면 안내 문구, 아니면 null. */
export const toNewUserNotice = (limit: ListingLimit | null, price: number): NewUserNotice | null => {
  if (!limit?.isNewUser) return null;
  const limitText = formatWonText(limit.limitPrice);
  const until = new Date(limit.limitEndsAt).toLocaleString('ko-KR', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  return {
    body: pricingCopy.newUser.body(limit.newUserDays, limitText, until),
    overMessage: price >= limit.limitPrice ? pricingCopy.newUser.over(limitText) : null,
  };
};
