import React from 'react';
import { Icon } from '../common/Icon';

interface SearchResultStateProps {
  readonly icon: string;
  readonly message: string;
  readonly hint?: string;
  /** 버튼 (다시 시도, 필터 초기화 등). 둘 다 있을 때만 보여준다. */
  readonly actionLabel?: string;
  readonly onAction?: () => void;
}

/** 검색 결과 자리의 로딩·0건·오류 안내. */
export const SearchResultState: React.FC<SearchResultStateProps> = ({ icon, message, hint, actionLabel, onAction }) => (
  <div className="flex flex-col items-center justify-center gap-space-xs py-space-section text-center">
    <Icon className="text-[40px] text-muted" name={icon} />
    <p className="font-heading-4 text-heading-4 text-ink">{message}</p>
    {hint && <p className="font-body-sm text-body-sm text-muted">{hint}</p>}
    {actionLabel && onAction ? (
      <button
        className="mt-space-sm px-space-md py-space-xs rounded border border-hairline-strong font-ui-sm text-ui-sm text-ink hover:bg-surface-container transition-colors"
        onClick={onAction}
        type="button"
      >
        {actionLabel}
      </button>
    ) : null}
  </div>
);

export default SearchResultState;
