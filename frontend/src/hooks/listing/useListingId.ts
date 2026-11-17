import { useParams } from 'react-router-dom';

/** 라우트의 `:id`. 없으면 빈 문자열 → 상세 화면은 "판매글 없음"으로 처리한다. */
export const useListingId = (): string => {
  const { id } = useParams<{ id: string }>();
  return id ?? '';
};
