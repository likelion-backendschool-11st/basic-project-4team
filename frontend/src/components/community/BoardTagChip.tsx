import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../data/layout';
import { Icon } from '../common/Icon';

export interface BoardTagChipProps {
  readonly label: string;
  readonly icon: string;
  /** 품목 slug. null이면(품목 없는 글) 링크 없이 칩만 보인다. */
  readonly itemId: string | null;
}

const chipClass = 'font-ui-label text-ui-label text-forest bg-mint-100 px-space-xs py-space-xxs rounded flex items-center gap-1';

/** Mint board/topic chip linking to the item discussion room. */
export const BoardTagChip: React.FC<BoardTagChipProps> = ({ label, icon, itemId }) =>
  itemId ? (
    <Link className={`${chipClass} hover:bg-mint-200 transition-colors`} to={ROUTES.itemDiscussion(itemId)}>
      <Icon className="text-[14px]" name={icon} />
      {label}
    </Link>
  ) : (
    <span className={chipClass}>
      <Icon className="text-[14px]" name={icon} />
      {label}
    </span>
  );

export default BoardTagChip;
