import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../data/layout';
import { Icon } from '../common/Icon';

export interface BoardTagChipProps {
  readonly label: string;
  readonly icon: string;
  readonly itemId: string;
}

/** Mint board/topic chip linking to the item discussion room. */
export const BoardTagChip: React.FC<BoardTagChipProps> = ({ label, icon, itemId }) => (
  <Link
    className="font-ui-label text-ui-label text-forest bg-mint-100 hover:bg-mint-200 px-space-xs py-space-xxs rounded flex items-center gap-1 transition-colors"
    to={ROUTES.itemDiscussion(itemId)}
  >
    <Icon className="text-[14px]" name={icon} />
    {label}
  </Link>
);

export default BoardTagChip;
