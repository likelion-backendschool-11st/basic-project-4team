import React from 'react';
import { Icon } from '../common/Icon';

interface SearchResultStateProps {
  readonly icon: string;
  readonly message: string;
  readonly hint?: string;
}

/** 검색 결과 자리의 로딩·0건·오류 안내. */
export const SearchResultState: React.FC<SearchResultStateProps> = ({ icon, message, hint }) => (
  <div className="flex flex-col items-center justify-center gap-space-xs py-space-section text-center">
    <Icon className="text-[40px] text-muted" name={icon} />
    <p className="font-heading-4 text-heading-4 text-ink">{message}</p>
    {hint && <p className="font-body-sm text-body-sm text-muted">{hint}</p>}
  </div>
);

export default SearchResultState;
