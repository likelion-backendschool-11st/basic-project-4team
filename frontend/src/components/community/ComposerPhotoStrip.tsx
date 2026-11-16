import React from 'react';
import { feedComposer } from '../../data/community';
import type { ComposerImage } from '../../hooks/community/useFeedComposer';
import { Icon } from '../common/Icon';

export interface ComposerPhotoStripProps {
  readonly images: readonly ComposerImage[];
  readonly onRemove: (key: string) => void;
}

/** 글쓰기 중 첨부한 사진 미리보기 — 업로드 중·실패 표시, 사진 빼기. */
export const ComposerPhotoStrip: React.FC<ComposerPhotoStripProps> = ({ images, onRemove }) => (
  <div className="flex items-center gap-space-xs flex-wrap mt-space-xs">
    {images.map((img, i) => (
      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-surface-container-low" key={img.key}>
        <img
          alt={feedComposer.photo.alt(i + 1)}
          className={`w-full h-full object-cover ${img.status === 'done' ? '' : 'opacity-50'}`}
          src={img.previewUrl}
        />
        {img.status === 'uploading' && (
          <span className="absolute inset-0 flex items-center justify-center">
            <Icon className="text-[20px] text-on-surface animate-spin" name="progress_activity" />
          </span>
        )}
        {img.status === 'error' && (
          <span className="absolute inset-0 flex items-center justify-center">
            <Icon className="text-[20px] text-error" name="error" />
          </span>
        )}
        <button
          aria-label={feedComposer.photo.removeLabel}
          className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-ink/60 text-on-primary flex items-center justify-center"
          onClick={() => onRemove(img.key)}
          type="button"
        >
          <Icon className="text-[14px]" name="close" />
        </button>
      </div>
    ))}
    <span className="font-caption text-caption text-muted">
      {feedComposer.photo.counter(images.length, feedComposer.photo.max)}
    </span>
  </div>
);

export default ComposerPhotoStrip;
