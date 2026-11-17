import { getMyItemRequests } from '../../api/itemRequest';
import { myListCopy } from '../../data/mypage';
import { usePagedList } from '../mypage/usePagedList';

/** 마이페이지 "품목 요청" 탭 — 내가 보낸 품목 등록 요청 (ITEM-07). */
export const useMyItemRequests = () =>
  usePagedList({ fetchPage: getMyItemRequests, pageSize: myListCopy.pageSize, windowSize: myListCopy.windowSize });

export default useMyItemRequests;
