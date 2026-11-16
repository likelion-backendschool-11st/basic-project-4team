import React from 'react';
import { headerData } from '../../data/layout';

interface HeaderCountBadgeProps {
  readonly count: number;
  readonly tone?: 'primary' | 'soft';
}

/** 헤더 버튼 옆 숫자 배지. 0이면 숨기고, 100 이상은 "99+". */
export const HeaderCountBadge: React.FC<HeaderCountBadgeProps> = ({ count, tone = 'primary' }) => {
  if (count <= 0) return null;
  const toneClass = tone === 'primary' ? 'bg-primary-container text-on-primary rounded-full' : 'bg-mint-100 text-forest rounded';
  return (
    <span className={`font-micro text-micro px-1.5 py-0.5 leading-none ${toneClass}`}>
      {headerData.badgeText(count, headerData.badgeMax)}
    </span>
  );
};

export default HeaderCountBadge;
