import React, { useEffect, useRef } from 'react';
import { imageViewerCopy as copy, type CommunityImage } from '../../data/community';
import { Icon } from '../common/Icon';

export interface ImageViewerProps {
  readonly images: readonly CommunityImage[];
  /** 보여줄 사진 순번. null이면 닫힘. */
  readonly index: number | null;
  readonly onClose: () => void;
  readonly onPrev: () => void;
  readonly onNext: () => void;
}

const navButtonClass =
  'absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-ink/60 text-on-primary flex items-center justify-center hover:bg-ink/80 transition-colors';

/** 글 사진 확대 보기 — Esc·바깥 클릭으로 닫고, ←/→ 키나 버튼으로 넘긴다. */
export const ImageViewer: React.FC<ImageViewerProps> = ({ images, index, onClose, onPrev, onNext }) => {
  const closeRef = useRef<HTMLButtonElement>(null);
  const isOpen = index !== null;

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    // 열려 있는 동안 뒤 페이지가 스크롤되지 않게 한다.
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose, onPrev, onNext]);

  if (index === null) return null;
  const image = images[index];
  if (!image) return null;
  const many = images.length > 1;

  return (
    <div
      aria-label={copy.dialogLabel}
      aria-modal="true"
      className="fixed inset-0 z-50 bg-ink/90 flex items-center justify-center p-space-md"
      onClick={onClose}
      role="dialog"
    >
      <button
        aria-label={copy.closeLabel}
        className="absolute top-space-md right-space-md w-10 h-10 rounded-full bg-ink/60 text-on-primary flex items-center justify-center hover:bg-ink/80 transition-colors"
        onClick={onClose}
        ref={closeRef}
        type="button"
      >
        <Icon className="text-[24px]" name={copy.closeIcon} />
      </button>
      <img
        alt={image.alt}
        className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-xl"
        onClick={(e) => e.stopPropagation()}
        src={image.src}
      />
      {many && (
        <>
          <button
            aria-label={copy.prevLabel}
            className={`${navButtonClass} left-space-md`}
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            type="button"
          >
            <Icon className="text-[28px]" name={copy.prevIcon} />
          </button>
          <button
            aria-label={copy.nextLabel}
            className={`${navButtonClass} right-space-md`}
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            type="button"
          >
            <Icon className="text-[28px]" name={copy.nextIcon} />
          </button>
          <span className="absolute bottom-space-md left-1/2 -translate-x-1/2 px-space-sm py-1 rounded-full bg-ink/60 text-on-primary font-caption text-caption">
            {copy.counter(index + 1, images.length)}
          </span>
        </>
      )}
    </div>
  );
};

export default ImageViewer;
