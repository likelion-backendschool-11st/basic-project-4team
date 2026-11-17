import { useEffect, useState } from 'react';
import type { ListingListResponse, ListingSummary } from '../../api/types';

export interface ListingSummariesState {
  readonly items: readonly ListingSummary[];
  readonly totalCount: number;
  /** 첫 응답을 받기 전에는 true. 실패해도 false가 되고 빈 목록으로 남는다. */
  readonly loading: boolean;
}

const EMPTY: ListingSummariesState = { items: [], totalCount: 0, loading: true };

/**
 * ListingSummary 목록 API(ITEM-05·LISTING-10)를 key가 바뀔 때마다 불러온다.
 * 상세 화면의 보조 영역이라 실패하면 조용히 빈 목록을 보여준다.
 */
export const useListingSummaries = (key: string, load: () => Promise<ListingListResponse>): ListingSummariesState => {
  const [state, setState] = useState<ListingSummariesState>(EMPTY);

  useEffect(() => {
    // 다른 판매글로 이동한 뒤 늦게 온 이전 응답이 화면을 덮어쓰지 않게 한다.
    let cancelled = false;
    setState(EMPTY);
    load()
      .then(({ items, totalCount }) => {
        if (!cancelled) setState({ items, totalCount, loading: false });
      })
      .catch(() => {
        if (!cancelled) setState({ items: [], totalCount: 0, loading: false });
      });
    return () => {
      cancelled = true;
    };
    // load는 렌더마다 새로 만들어지므로, 요청 조건을 담은 key가 바뀔 때만 다시 부른다.
  }, [key]);

  return state;
};
