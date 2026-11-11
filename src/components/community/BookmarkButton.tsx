import React from 'react';
import { discussionPostCopy } from '../../data/community';
import { useToggle } from '../../hooks/community/useToggle';
import { Icon } from '../common/Icon';

export interface BookmarkButtonProps {
  readonly initial?: boolean;
}

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({ initial = false }) => {
  const [saved, toggle] = useToggle(initial);
  return (
    <button
      aria-label="북마크"
      aria-pressed={saved}
      className={`p-1 rounded hover:text-on-surface ${saved ? 'text-primary' : 'text-muted'}`}
      onClick={toggle}
      type="button"
    >
      <Icon
        className="text-[18px]"
        filled={saved}
        name={saved ? discussionPostCopy.bookmarkActiveIcon : discussionPostCopy.bookmarkIcon}
      />
    </button>
  );
};

export default BookmarkButton;
