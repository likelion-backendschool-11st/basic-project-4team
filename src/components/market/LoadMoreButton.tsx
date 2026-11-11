import React from 'react';
import { Icon } from '../common/Icon';

interface LoadMoreButtonProps {
  readonly label: string;
  readonly summary: string;
  readonly disabled: boolean;
  readonly onClick: () => void;
}

/** "더 보기" trigger with a shown/total summary line. */
export const LoadMoreButton: React.FC<LoadMoreButtonProps> = ({ label, summary, disabled, onClick }) => (
  <div className="py-space-xl text-center flex flex-col items-center justify-center gap-space-xs">
    <button
      className="px-space-xl py-space-xs bg-canvas border border-hairline-strong/80 hover:bg-surface-container text-on-surface font-ui-sm text-ui-sm font-bold rounded-lg shadow-sm transition-all flex items-center gap-space-xs disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <span>{label}</span>
      <Icon className="text-[16px]" name="expand_more" />
    </button>
    <span className="text-micro text-muted">{summary}</span>
  </div>
);

export default LoadMoreButton;
