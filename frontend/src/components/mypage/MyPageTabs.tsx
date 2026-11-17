import React from 'react';
import type { MyActivityCounts } from '../../api/types';
import { myPageCopy, type MyPageTab } from '../../data/mypage';
import { Icon } from '../common/Icon';

interface MyPageTabsProps {
  /** 보여줄 탭 (관리자면 품목 요청 관리 포함). */
  readonly tabs: readonly MyPageTab[];
  readonly active: MyPageTab;
  readonly counts: MyActivityCounts;
  readonly onSelect: (tab: MyPageTab) => void;
}

/** 탭 옆 숫자. 계정 설정은 숫자 없음. */
const tabCount = (tab: MyPageTab, counts: MyActivityCounts): number | null => {
  switch (tab) {
    case 'sales':
      return counts.selling + counts.reserved + counts.sold;
    case 'purchases':
      return counts.purchased;
    case 'wishes':
      return counts.wishes;
    case 'posts':
      return counts.posts;
    case 'comments':
      return counts.comments;
    default:
      return null;
  }
};

/** 마이페이지 탭 바. 좁은 화면에서는 가로 스크롤. */
export const MyPageTabs: React.FC<MyPageTabsProps> = ({ tabs, active, counts, onSelect }) => (
  <div aria-label={myPageCopy.tabsAria} className="flex overflow-x-auto border-b border-hairline -mx-1 px-1" role="tablist">
    {tabs.map((tab) => {
      const selected = tab === active;
      const count = tabCount(tab, counts);
      const { label, icon } = myPageCopy.tabs[tab];
      return (
        <button
          aria-selected={selected}
          className={`shrink-0 flex items-center gap-1 px-space-sm py-space-sm border-b-2 -mb-px font-ui-sm text-ui-sm transition-colors ${
            selected ? 'border-ink text-ink font-bold' : 'border-transparent text-muted hover:text-ink'
          }`}
          key={tab}
          onClick={() => onSelect(tab)}
          role="tab"
          type="button"
        >
          <Icon className="text-[18px]" filled={selected} name={icon} />
          {label}
          {count !== null && (
            <span className={`font-micro text-micro tabular-nums ${selected ? 'text-primary' : 'text-faint'}`}>{count}</span>
          )}
        </button>
      );
    })}
  </div>
);

export default MyPageTabs;
