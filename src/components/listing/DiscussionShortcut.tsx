import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../common/Icon';
import { ROUTES } from '../../data/layout';

interface DiscussionShortcutProps {
  readonly itemId: string;
  readonly label: string;
  readonly count?: number;
  /** chip: inline next to category · button: action bar · link: seller panel. */
  readonly variant: 'chip' | 'button' | 'link';
  readonly title?: string;
}

/** Shortcut to the item's community discussion room (품목 토론방). */
export const DiscussionShortcut: React.FC<DiscussionShortcutProps> = ({ itemId, label, count, variant, title }) => {
  const to = ROUTES.itemDiscussion(itemId);

  if (variant === 'button') {
    return (
      /* data-component="ItemDiscussionShortcutButton" */
      <Link
        className="flex-shrink-0 h-12 px-3.5 bg-mint-50 hover:bg-mint-100 border border-mint-200 hover:border-primary-container rounded text-forest font-ui-label text-ui-label flex items-center justify-center gap-1.5 transition-colors"
        title={title}
        to={to}
      >
        <Icon className="text-[20px] text-primary-container" name="forum" />
        <span>{label}</span>
        {count !== undefined && (
          <span className="bg-mint-200 text-forest font-micro text-micro px-1.5 py-0.5 rounded-full font-bold">{count}</span>
        )}
      </Link>
    );
  }

  if (variant === 'link') {
    return (
      /* data-component="ItemDiscussionShortcutButton" */
      <Link
        className="inline-flex items-center gap-1.5 px-space-sm py-1 font-ui-sm text-ui-sm text-primary-container bg-mint-50 hover:bg-mint-100 border border-mint-200 rounded transition-colors shadow-sm"
        to={to}
      >
        <Icon className="text-[16px]" name="forum" />
        <span>{label}</span>
        <Icon className="text-[14px]" name="arrow_forward" />
      </Link>
    );
  }

  return (
    <Link
      className="inline-flex items-center gap-1 px-2.5 py-1 text-forest bg-mint-50 hover:bg-mint-100 border border-mint-200 rounded transition-colors text-caption font-ui-sm"
      to={to}
    >
      <Icon className="text-[15px] text-primary-container" name="forum" />
      <span className="font-medium">{label}</span>
      {count !== undefined && <span className="text-primary font-bold text-micro">{count}</span>}
    </Link>
  );
};

export default DiscussionShortcut;
