import React from 'react';
import { Icon } from '../common/Icon';

interface CategoryToggleButtonProps {
  readonly label: string;
  readonly open: boolean;
  readonly controlsId: string;
  readonly onToggle: () => void;
}

/** "카테고리 ▲/▼" trigger (the shared GNB has no category button, so it lives with the panel). */
export const CategoryToggleButton: React.FC<CategoryToggleButtonProps> = ({ label, open, controlsId, onToggle }) => (
  <button
    aria-controls={controlsId}
    aria-expanded={open}
    className="group inline-flex items-center gap-2 px-3 py-1.5 font-bold text-xs sm:text-sm text-primary-deep bg-mint-50 border border-mint-200 rounded hover:bg-primary-container hover:text-on-primary transition focus:outline-none"
    onClick={onToggle}
    type="button"
  >
    <Icon className="text-[18px]" name="menu" />
    <span>{label}</span>
    <span className="text-xs transition-transform duration-200">{open ? '▲' : '▼'}</span>
  </button>
);

export default CategoryToggleButton;
