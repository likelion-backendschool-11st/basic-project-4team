import { useEffect, useState } from 'react';
import { ApiError } from '../../api/client';
import { getListing } from '../../api/listings';
import type { ListingDetail } from '../../api/types';

export type ListingDetailState =
  | { readonly status: 'loading' }
  | { readonly status: 'notFound' }
  | { readonly status: 'error' }
  | { readonly status: 'success'; readonly listing: ListingDetail };

/** 판매글 상세(LISTING-02)를 불러온다. id가 바뀌면 다시 불러온다. */
export const useListingDetail = (listingId: string): ListingDetailState => {
  const [state, setState] = useState<ListingDetailState>({ status: 'loading' });

  useEffect(() => {
    // 응답이 늦게 와도 이전 id의 결과로 화면을 덮어쓰지 않게 한다.
    let cancelled = false;
    // 판매글 id는 양의 정수. 아니면 요청하지 않고 바로 "없음".
    if (!/^[1-9]\d*$/.test(listingId)) {
      setState({ status: 'notFound' });
      return undefined;
    }
    setState({ status: 'loading' });
    getListing(listingId)
      .then((listing) => {
        if (!cancelled) setState({ status: 'success', listing });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setState({ status: err instanceof ApiError && err.status === 404 ? 'notFound' : 'error' });
      });
    return () => {
      cancelled = true;
    };
  }, [listingId]);

  return state;
};
