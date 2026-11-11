import React from 'react';
import { Icon } from '../common/Icon';
import { useCopyUrl } from '../../hooks/listing/useCopyUrl';

interface CopyUrlButtonProps {
  readonly onCopied?: (copied: boolean) => void;
  readonly variant?: 'buyer' | 'seller';
}

/** "URL 복사" button — copies the current page link to the clipboard. */
export const CopyUrlButton: React.FC<CopyUrlButtonProps> = ({ onCopied, variant = 'buyer' }) => {
  const copy = useCopyUrl(onCopied);

  if (variant === 'seller') {
    return (
      /* data-component="URLCopyButton" */
      <button
        className="flex items-center gap-1 text-muted hover:text-ink font-ui-sm text-ui-sm p-1.5 rounded hover:bg-canvas-soft transition-colors shrink-0"
        onClick={copy}
        title="URL 공유 복사"
        type="button"
      >
        <Icon className="text-[18px]" name="share" />
        <span>URL 복사</span>
      </button>
    );
  }

  return (
    <button
      className="flex items-center gap-1 px-2.5 py-1 text-muted hover:text-ink bg-canvas-soft hover:bg-hairline rounded transition-colors text-caption font-ui-sm shrink-0"
      onClick={copy}
      title="링크 복사"
      type="button"
    >
      <Icon className="text-[16px]" name="link" />
      <span>URL 복사</span>
    </button>
  );
};

export default CopyUrlButton;
