import React from 'react';
import { copyUrlCopy as copy } from '../../data/listing';
import { useCopyUrl } from '../../hooks/listing/useCopyUrl';
import { Icon } from '../common/Icon';

interface CopyUrlButtonProps {
  /** 복사할 공개 주소 (예: /listings/16). */
  readonly sharePath: string;
  readonly onCopied?: (copied: boolean) => void;
  readonly variant?: 'buyer' | 'seller';
}

/** "URL 복사" 버튼 — 판매글 공개 주소를 클립보드에 복사한다. 결과는 onCopied로 알린다(토스트). */
export const CopyUrlButton: React.FC<CopyUrlButtonProps> = ({ sharePath, onCopied, variant = 'buyer' }) => {
  const copyUrl = useCopyUrl(sharePath, onCopied);

  if (variant === 'seller') {
    return (
      /* data-component="URLCopyButton" */
      <button
        className="flex items-center gap-1 text-muted hover:text-ink font-ui-sm text-ui-sm p-1.5 rounded hover:bg-canvas-soft transition-colors shrink-0"
        onClick={copyUrl}
        title={copy.sellerTitle}
        type="button"
      >
        <Icon className="text-[18px]" name="share" />
        <span>{copy.label}</span>
      </button>
    );
  }

  return (
    <button
      className="flex items-center gap-1 px-2.5 py-1 text-muted hover:text-ink bg-canvas-soft hover:bg-hairline rounded transition-colors text-caption font-ui-sm shrink-0"
      onClick={copyUrl}
      title={copy.buyerTitle}
      type="button"
    >
      <Icon className="text-[16px]" name="link" />
      <span>{copy.label}</span>
    </button>
  );
};

export default CopyUrlButton;
