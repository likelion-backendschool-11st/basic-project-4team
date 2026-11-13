import React from 'react';
import { discussionPostCopy } from '../../data/community';
import { useDisclosure } from '../../hooks/community/useDisclosure';
import { Icon } from '../common/Icon';

export interface PostMoreMenuItem {
  readonly key: string;
  readonly icon: string;
  readonly label: string;
  readonly danger: boolean;
}

export interface PostMoreMenuProps {
  readonly onSelect?: (key: string) => void;
  /** 메뉴 항목. 기본값은 공유 / 신고하기. */
  readonly items?: readonly PostMoreMenuItem[];
}

/** "⋮" overflow menu (기본: 공유 / 신고하기). */
export const PostMoreMenu: React.FC<PostMoreMenuProps> = ({ onSelect, items = discussionPostCopy.menu }) => {
  const { open, toggle, close, ref } = useDisclosure<HTMLDivElement>();
  return (
    <div className="relative" ref={ref}>
      <button
        aria-expanded={open}
        aria-label="더보기"
        className="p-1 rounded text-muted hover:text-on-surface hover:bg-surface-container-low transition-colors"
        onClick={toggle}
        type="button"
      >
        <Icon className="text-[18px]" name={discussionPostCopy.menuIcon} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-28 bg-surface-container-lowest rounded-lg shadow-md py-1 z-10 font-caption text-caption text-on-surface">
          {items.map((m) => (
            <button
              className={`w-full text-left px-space-sm py-1.5 flex items-center gap-1 ${
                m.danger ? 'text-error hover:bg-error-container hover:text-on-error-container' : 'hover:bg-surface-container-low'
              }`}
              key={m.key}
              onClick={() => {
                onSelect?.(m.key);
                close();
              }}
              type="button"
            >
              <Icon className="text-[14px]" name={m.icon} />
              {m.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostMoreMenu;
